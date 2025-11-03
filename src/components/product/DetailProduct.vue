<script setup>
import { ref, onMounted, watch, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { get_productID_api } from '@/services/product';
import { formatPrice } from '@/composables/useUtils';
import { useNotification } from '@/composables/useNotification';
import { get_auth_user } from '@/stores/auth';
import { useProductStore } from '@/stores/product';
import { updateMetaTag, updateCanonicalLink } from '@/utils/meta';
import ProductCard from '@/components/product/Card.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';
import { useCartStore } from '@/stores/cart';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { showNotification } = useNotification();
const cartStore = useCartStore();

const productStore = useProductStore();
const product = ref(null);
const relatedProducts = ref([])

const isLoading = ref(true);

const jsonLdScriptContent = computed(() => {
  if (!product.value) {
    return null;
  }
  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.value.name,
    "image": product.value.image_urls?.[0] || '',
    "description": product.value.description || `Mua ngay ${product.value.name} tại TuniToku Store.`,
    "brand": {
      "@type": "Brand",
      // ===== SỬA ĐỔI TẠI ĐÂY =====
      // Đọc tên từ mảng categories thay vì category_name
      "name": product.value.categories?.[0]?.name || "TuniToku Store"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href, 
      "priceCurrency": "VND",
      "price": discountedPrice.value || product.value.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock" 
    }
  };
  return JSON.stringify(data, null, 2);
});

watchEffect(() => {
  if (product.value) {
    const title = `${product.value.name} - TuniToku Store`;
    const description = product.value.description?.substring(0, 160) || `Mua ngay ${product.value.name} chính hãng giá tốt.`;
    const imageUrl = product.value.image_urls?.[0] || '';
    const currentUrl = window.location.href;

    updateMetaTag('title', title);
    updateMetaTag('description', description);
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', imageUrl, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', imageUrl);

    updateCanonicalLink(currentUrl);
  }
});

const quantity = ref(1);
const mainImage = ref('');

const discountPercentage = computed(() => {
  return get_auth_user.value?.discountPercentage || 0;
});

const discountedPrice = computed(() => {
  if (product.value && discountPercentage.value > 0) {
    return product.value.price * (1 - discountPercentage.value);
  }
  return product.value?.price;
});

const incrementQuantity = () => quantity.value++;
const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

const fetchProductData = async (productId) => {
  if (!productId) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  try {
    const fetchedProduct = await get_productID_api(productId);
    product.value = fetchedProduct;

    if (product.value.image_urls?.length > 0) {
      mainImage.value = product.value.image_urls[0];
    }

    // ===== SỬA ĐỔI TẠI ĐÂY =====
    // Lấy ID của danh mục ĐẦU TIÊN từ mảng categories
    const firstCategory = product.value.categories?.[0];

    if (firstCategory) {
      const categoryId = firstCategory.ID; // Lấy ID
      
      // Tiếp tục logic tìm sản phẩm liên quan
      let related = productStore.getRelatedProducts(categoryId, product.value.ID, 6);
      if (related.length < 6) {
        await productStore.ensureCategoryProducts(categoryId); // Truyền ID hợp lệ
        related = productStore.getRelatedProducts(categoryId, product.value.ID, 6);
      }
      relatedProducts.value = related;
    } else {
      // Nếu sản phẩm không có danh mục nào
      relatedProducts.value = [];
    }
    // ===== KẾT THÚC SỬA ĐỔI =====

  } catch (err) {
    console.error("Failed to fetch product data:", err);
    product.value = null;
    showNotification(err, 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  fetchProductData(route.params.id);
});

watch(() => route.params.id, (newId) => {
  if (newId) {
    window.scrollTo(0, 0);
    fetchProductData(newId);
  }
});

const handleAddToCart = async () => {
  if (!get_auth_user.value) {
    showNotification('Bạn cần đăng nhập để thêm vào giỏ hàng.', 'error');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  try {
    await cartStore.addItem(product.value.ID, quantity.value);
    showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
  } catch (err) {
    showNotification(err, 'error');
  }
};
</script>

<template>
  <component :is="'script'" type="application/ld+json" v-if="jsonLdScriptContent">
    {{ jsonLdScriptContent }}
  </component>
  <LoadingSpinner v-if="isLoading" :message="t('detailProduct.loading')" />
  
  <div v-else class="container">

    <main class="main-content-grid">
      <div class="image-gallery card-white">
        <div class="main-image-wrapper">
          <img loading="lazy" :src="mainImage" :alt="product.name" class="img-main" />
        </div>
        <div class="thumbnail-list">
          <img loading="lazy" v-for="image in product.image_urls" :key="image" :src="image"
            :class="{ active: mainImage === image }" @click="mainImage = image" alt="Thumbnail" />
        </div>
      </div>

      <div class="info-panel card-white">
        <h1 class="product-title">{{ product.name }}</h1>
        <div v-if="discountPercentage > 0" class="price-info">
          <p class="original-price">{{ formatPrice(product.price) }}</p>
          <p class="product-price">{{ formatPrice(discountedPrice) }}</p>
        </div>
        <p v-else class="product-price">{{ formatPrice(product.price) }}</p>

        <div class="actions">
          <div class="quantity-selector">
            <button @click="decrementQuantity" aria-label="Giảm số lượng">-</button>
            <input type="text" :value="quantity" readonly aria-label="Số lượng hiện tại" />
            <button @click="incrementQuantity" aria-label="Tăng số lượng">+</button>
          </div>

          <button class="btn-primary" @click="handleAddToCart" :disabled="cartStore.isLoading">
            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
          </button>
        </div>

        <div class="trust-bar">
          <div class="trust-item"><i class="fas fa-shield-alt"></i> <span>{{ t('detailProduct.fa-shield-alt') }}</span></div>
          <div class="trust-item"><i class="fas fa-truck-fast"></i> <span>{{ t('detailProduct.fa-truck-fast') }}</span></div>
          <div class="trust-item"><i class="fas fa-box-open"></i> <span>{{ t('detailProduct.fa-box-open') }}</span></div>
        </div>
      </div>
    </main>

    <div class="description-card card-white">
      <section class="description-section">
        <h3>THÔNG TIN SẢN PHẨM</h3>
        <p class="pre-line-text">{{ product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' }}</p>
      </section>
    </div>
    
    <section class="related-products-section">
      <h2>SẢN PHẨM LIÊN QUAN</h2>
      <div class="product-grid">
        <ProductCard v-for="productitem in relatedProducts" :key="productitem.ID" :product="productitem" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.container {
  margin: 40px auto;
}

.card-white {
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: clamp(20px, 4vw, 40px);
  overflow: hidden;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.main-image-wrapper {
  aspect-ratio: 1 / 0.7;
  background-color: var(--light-gray-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
}

.main-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image-wrapper img:hover {
  transform: scale(1.05);
}

.thumbnail-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.thumbnail-list img {
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 8px;
  border: 2px solid var(--light-gray-color); 
  cursor: pointer;
  object-fit: cover;
  transition: all 0.2s ease;
}

.thumbnail-list img.active,
.thumbnail-list img:hover {
  border-color: var(--primary-color);
  opacity: 1;
}

.info-panel {
  display: flex;
  flex-direction: column;
}

.product-brand {
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  font-weight: 500;
  color: var(--text-color);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.product-title {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  font-weight: 700;
  color: var(--secondary-color);
  line-height: 1.2;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 24px 0;
  flex-wrap: wrap;
}

.original-price {
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  color: #999;
  text-decoration: line-through;
}

.product-price {
  font-size: clamp(1.8rem, 5vw, 2.2rem);
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

/* THAY ĐỔI: Layout .actions chỉ còn 2 cột */
.actions {
  display: grid;
  grid-template-columns: auto 1fr; /* Cột 1 cho số lượng, Cột 2 cho nút */
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border-radius: var(--border-radius);
  overflow: hidden;
  height: clamp(40px, 5vh, 48px);
}

.quantity-selector input {
  width: clamp(40px, 6vw, 50px);
  height: 100%;
  text-align: center;
  background-color: var(--white-color);
  color: var(--text-color);
  border: none;
  border-top: 1px solid var(--light-gray-color);
  border-bottom: 1px solid var(--light-gray-color);
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  font-weight: 600;
}

.quantity-selector button {
  background-color: var(--light-gray-color);
  color: var(--text-color);
  border: none;
  width: clamp(35px, 5vw, 40px);
  height: 100%;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  cursor: pointer;
  transition: background-color var(--transition-speed);
}

.quantity-selector button:hover {
  background-color: #d1d5db;
}

/* THAY ĐỔI: Nút "Thêm vào giỏ" là nút chính */
.btn-primary {
  width: 100%;
  gap: 10px;
  height: clamp(40px, 5vh, 48px);
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ĐÃ XOÁ: .btn-secondary (vì .btn-primary đã thay thế) */

.trust-bar {
  display: flex;
  flex-direction: column;
  gap: 20px; 
  margin-top: auto; 
  padding-top: 20px; 
  border-top: 1px solid var(--light-gray-color);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.description-card {
  margin-top: 40px;
}

.description-section h3,
.related-products-section h2 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--secondary-color);
  margin-bottom: 16px;
}

.description-section p {
  font-size: clamp(0.9rem, 2vw, 1rem);
  line-height: 1.8;
  color: var(--text-color);
}

.related-products-section {
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: clamp(20px, 4vw, 40px);
  margin-top: 40px; 
}

.product-grid {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

.product-grid .product-card {
  width: 250px;
  flex-shrink: 0;
}

.product-grid::-webkit-scrollbar {
  height: 8px;
}

.product-grid::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.product-grid::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
}

@media (max-width: 992px) {
  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .trust-bar {
    margin-top: 32px;
  }
}

@media (max-width: 768px) {
  .product-grid .product-card {
    width: 150px;
    flex-shrink: 0;
  }

  .card-white,
  .related-products-section {
    padding: 20px;
  }
  
  /* THAY ĐỔI: Sửa layout .actions trên mobile */
  .actions {
    display: flex;
    flex-direction: column; /* Xếp chồng lên nhau */
    gap: 16px;
  }
  .quantity-selector {
    height: 48px;
    width: 100%; /* Chiếm 100% */
  }
  .quantity-selector input {
     height: 100%;
     width: 100%; /* Input chiếm 100% */
     flex-grow: 1;
  }
  .quantity-selector button {
    width: 50px; /* Nút 2 bên cố định */
    height: 100%;
  }
  .btn-primary {
    width: 100%;
  }
}
</style>

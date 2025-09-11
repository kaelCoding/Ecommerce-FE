<script setup>
import { ref, onMounted, watch, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { get_productID_api } from '@/services/product';
import { submit_order_api } from '@/services/order';
import { formatPrice } from '@/composables/useUtils';
import { useNotification } from '@/composables/useNotification';
import { get_auth_user } from '@/stores/auth';
import { useProductStore } from '@/stores/product';
import { updateMetaTag, updateCanonicalLink } from '@/utils/meta';
import ProductCard from '@/components/product/Card.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const { showNotification } = useNotification();

const productStore = useProductStore();
const product = ref(null);
const relatedProducts = ref([])

const isLoading = ref(true);
const isSubmitting = ref(false)

const quantity = ref(1);
const mainImage = ref('');
const isCheckoutModalOpen = ref(false);
const customerInfo = ref({
  phone: '',
  address: '',
  paymentMethod: 'cod',
});

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

const openCheckoutModal = () => { isCheckoutModalOpen.value = true; };
const closeCheckoutModal = () => {
  isCheckoutModalOpen.value = false;
  resetForm();
};

const resetForm = () => {
  customerInfo.value = {
    phone: '',
    address: '',
    paymentMethod: 'cod',
  };
  quantity.value = 1;
};

const submitOrder = async () => {
  isSubmitting.value = true
  const orderPayload = {
    productID: product.value.ID,
    quantity: quantity.value,
    customerName: get_auth_user.value.username,
    customerPhone: customerInfo.value.phone,
    customerAddress: customerInfo.value.address,
    customerEmail: get_auth_user.value.email,
    paymentMethod: customerInfo.value.paymentMethod,
  };

  try {
    await submit_order_api(orderPayload);
    showNotification('Đặt hàng thành công! Chúng tôi sẽ sớm liên hệ với bạn để xác nhận.')
    closeCheckoutModal();
  } catch (err) {
    console.error("Failed to submit order:", err);
    showNotification(err, 'error');
  } finally {
    isSubmitting.value = false;
  }
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

    const categoryId = product.value.category_id;
    let related = productStore.getRelatedProducts(categoryId, product.value.ID, 6);
    if (related.length < 6) {
      await productStore.ensureCategoryProducts(categoryId);
      related = productStore.getRelatedProducts(categoryId, product.value.ID, 6);
    }
    relatedProducts.value = related;
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

const handleCheckout = () => {
  if (get_auth_user.value) {
    openCheckoutModal();
  } else {
    showNotification('Bạn cần đăng nhập để tiến hành thanh toán.', 'error');
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    });
  }
};

const gotoChat = () => {
  if (get_auth_user.value) {
    router.push("/chat")
  } else {
    showNotification('Bạn cần đăng nhập để nhắn tin.', 'error');
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    });
  }
}

const jsonLdScriptContent = computed(() => {
  if (!product.value) return null;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.value.name,
    "image": product.value.image_urls[0],
    "description": product.value.description || `Mua ngay ${product.value.name} chính hãng tại Tuni Toku. Sản phẩm thuộc series ${product.value.category_name}. Cam kết chất lượng, giao hàng toàn quốc.`,
    "brand": {
      "@type": "Brand",
      "name": "Bandai"
    },
    "sku": `TUNI-${product.value.ID}`,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "VND",
      "price": discountedPrice.value,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return JSON.stringify(schema);
});

watchEffect(() => {
  if (product.value && product.value.name) {
    const siteName = 'Tuni Toku';
    const productName = product.value.name;
    const categoryName = product.value.category_name;
    const imageUrl = product.value.image_urls[0];
    const newTitle = `${productName} | ${categoryName} | ${siteName}`;
    const newDescription = `Mua ngay ${productName} chính hãng tại Tuni Toku. Sản phẩm thuộc series ${categoryName}. Cam kết chất lượng, giao hàng toàn quốc.`;
    
    document.title = newTitle;
    updateMetaTag('description', newDescription, false);
    updateMetaTag('og:title', newTitle);
    updateMetaTag('og:description', newDescription);
    updateMetaTag('og:url', window.location.href);
    updateMetaTag('og:image', imageUrl);
    updateMetaTag('twitter:title', newTitle, false);
    updateMetaTag('twitter:description', newDescription, false);
    updateMetaTag('twitter:image', imageUrl, false);
    updateCanonicalLink();
  }
});
</script>

<template>
  <component :is="'script'" type="application/ld+json" v-if="jsonLdScriptContent">
    {{ jsonLdScriptContent }}
  </component>
  <LoadingSpinner v-if="isLoading" message="Đang tải..." />
  <div v-else class="container">
    <main class="main-content-grid">
      <div class="image-gallery">
        <div class="main-image-wrapper">
          <img loading="lazy" :src="mainImage" :alt="product.name" class="img-main" />
        </div>
        <div class="thumbnail-list">
          <img loading="lazy" v-for="image in product.image_urls" :key="image" :src="image"
            :class="{ active: mainImage === image }" @click="mainImage = image" alt="Thumbnail" />
        </div>
      </div>

      <div class="info-panel">
        <p class="product-brand">{{ product.category_name }}</p>
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
          <button class="btn-primary" @click="handleCheckout">
            <i class="fas fa-credit-card"></i> THANH TOÁN
          </button>
          <button class="btn-primary" @click="gotoChat">
            <i class="fa-solid fa-comments"></i> NHẮN TIN TUNI
          </button>
        </div>

        <div class="trust-bar">
          <div class="trust-item"><i class="fas fa-shield-alt"></i> <span>Hàng chính hãng 100%</span></div>
          <div class="trust-item"><i class="fas fa-truck-fast"></i> <span>Giao hàng nhanh</span></div>
          <div class="trust-item"><i class="fas fa-box-open"></i> <span>Đổi trả hàng 7 ngày</span></div>
        </div>
      </div>
    </main>

    <section class="extended-info-grid">
      <div class="description-section">
        <h3>Mô tả chi tiết</h3>
        <p class="pre-line-text">{{ product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' }}</p>
      </div>
    </section>

    <section class="related-products-section">
      <h2>Sản phẩm tương tự</h2> <br>
      <div class="product-grid">
        <ProductCard v-for="productitem in relatedProducts" :key="productitem.ID" :product="productitem" />
      </div>
    </section>
  </div>

  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isCheckoutModalOpen" class="modal-backdrop" @click.self="closeCheckoutModal">
        <div class="checkout-modal">
          <div class="modal-header">
            <h3>Thông tin đặt hàng</h3>
            <button class="close-btn" @click="closeCheckoutModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <LoadingSpinner v-if="isSubmitting" message="Đang xử lý đơn hàng..." />
            <div v-else>
              <div class="summary">
                <p>Sản phẩm: <strong>{{ product.name }}</strong></p>
                <p>Số lượng: <strong>{{ quantity }}</strong></p>
                <p>Tổng tiền: <strong>{{ formatPrice(product.price * quantity) }}</strong></p>
                <p v-if="discountPercentage > 0">Thanh toán: <strong>{{ formatPrice(discountedPrice * quantity)
                    }}</strong></p>
              </div>

              <form @submit.prevent="submitOrder">
                <div class="form-group">
                  <label for="phone">Số điện thoại</label>
                  <input id="phone" type="tel" class="form-input" v-model="customerInfo.phone"
                    placeholder="Nhập số điện thoại của bạn" required>
                </div>
                <div class="form-group">
                  <label for="address">Địa chỉ</label>
                  <textarea id="address" class="form-input" v-model="customerInfo.address"
                    placeholder="Nhập địa chỉ nhận hàng" required></textarea>
                </div>

                <div class="form-group">
                  <label>Phương thức thanh toán</label>
                  <div class="payment-options">
                    <div class="radio-label">
                      <input type="radio" v-model="customerInfo.paymentMethod" value="cod">
                      <span>Thanh toán khi nhận hàng</span>
                    </div>
                    <div class="radio-label">
                      <input type="radio" v-model="customerInfo.paymentMethod" value="bank_transfer">
                      <span>Chuyển khoản ngân hàng</span>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn" @click="closeCheckoutModal">Hủy</button>
                  <button type="submit" class="btn-primary">Xác nhận đặt hàng</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.container {
  margin: 40px auto;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 60px;
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
  border: 2px solid var(--border-color);
  cursor: pointer;
  object-fit: cover;
  transition: all 0.2s ease;
}

.thumbnail-list img.active,
.thumbnail-list img:hover {
  border-color: var(--primary-color);
  opacity: 1;
}

.product-brand {
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  font-weight: 500;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.product-title {
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 24px 0;
}

.original-price {
  font-size: clamp(1.4rem, 4vw, 2rem);
  color: #999;
  text-decoration: line-through;
}

.product-price {
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.discount-badge {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
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

.btn-primary {
  flex-grow: 1;
  gap: 10px;
  height: clamp(40px, 5vh, 48px);
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.trust-bar {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.extended-info-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 60px;
  padding-top: 32px;
  margin-top: 60px;
  border-top: 1px solid var(--light-gray-color);
}

.description-section h3,
.related-products-section h2 {
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--text-color);
  margin-bottom: 16px;
}

.description-section p {
  font-size: clamp(0.9rem, 2vw, 1rem);
  line-height: 1.8;
  color: var(--text-color);
}

.related-products-section {
  padding-top: 32px;
  margin-top: 60px;
  border-top: 1px solid var(--light-gray-color);
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

  .extended-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .product-grid .product-card {
    width: 150px;
    flex-shrink: 0;
  }
}
</style>

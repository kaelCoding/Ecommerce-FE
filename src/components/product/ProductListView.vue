<script setup>
import { ref, onMounted } from 'vue';
import { get_products_api } from '@/services/product';
import { useRouter } from 'vue-router';
import ProductCard from '@/components/product/Card.vue';

const products = ref([]);
const isLoading = ref(true);
const router = useRouter();

const formatPrice = (value) => {
  if (!value) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const fetchedProducts = await get_products_api();
    products.value = fetchedProducts;
  } catch (err) {
    console.error("Failed to fetch products:", err);
  } finally {
    isLoading.value = false;
  }
};

const goToProductDetail = (productId) => {
  router.push({ name: 'product-detail', params: { id: productId } });
};

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div>
    <div class="container">
      <h1 class="page-title">Tất cả sản phẩm</h1>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
      <div v-else-if="products.length === 0" class="no-products-state">
        <p>Không có sản phẩm nào để hiển thị.</p>
      </div>
      <div v-else class="product-grid">
        <ProductCard v-for="product in products" :key="product.ID" :product="product" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding-top: 60px;
  padding-bottom: 60px;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 40px;
}

.loading-state,
.no-products-state {
  text-align: center;
  padding: 50px 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.product-card {
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  animation: fadeInUp 0.5s ease-in-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.product-image-container {
  height: 250px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
    margin-bottom: 30px;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .product-image-container {
    height: 180px;
  }

  .product-info {
    padding: 15px;
  }

  .product-name {
    font-size: 1rem;
  }
}
</style>
<script setup>
import { ref, onMounted } from 'vue';
import { get_products_api } from '@/services/product';
import ProductCard from '@/components/product/Card.vue';

const products = ref([]);
const isLoading = ref(true);

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
  margin: 40px auto;
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
</style>
<script setup>
import { onBeforeMount } from 'vue';
import { useNotification } from '@/composables/useNotification';
import { useProductStore } from '@/stores/product';
import ProductCard from '@/components/product/Card.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const showNotification = useNotification();
const productStore = useProductStore();

onBeforeMount(async () => {
  try {
    await productStore.fetchProductsForList();
  } catch (err) {
    showNotification(err, "error");
  }
});
</script>

<template>
  <div>
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Mô Hình - Đồ Chơi Tokusatsu</h1>
        <p class="category-description">Tất cả sản phẩm Kamen Rider, Super Sentai và các dòng Tokusatsu khác.</p>
      </div>

      <LoadingSpinner v-if="productStore.isLoading" message="Đang tải sản phẩm..." />
      <div v-else-if="!productStore.isLoading && productStore.listPageProducts.length === 0" class="no-products-state">
        <p>Không có sản phẩm nào để hiển thị.</p>
      </div>
      <div v-else class="products-ctn">
        <section v-for="categoryData in productStore.listPageProducts" :key="categoryData.ID" class="product-section">
          <h2 class="category-title">{{ categoryData.name }}</h2>
          <div class="product-grid">
            <ProductCard v-for="product in categoryData.products" :key="product.ID" :product="product" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--light-gray-color);
}

.category-description {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  color: var(--text-color);
  max-width: 600px;
  margin: 0 auto;
}

.no-products-state {
  text-align: center;
  padding: 50px 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.product-section {
  margin-bottom: 4rem;
}

.category-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight:600;
  color: var(--secondary-color);
  margin-bottom: 32px;
  position: relative;
}
</style>
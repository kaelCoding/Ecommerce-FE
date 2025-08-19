<script setup>
import { onBeforeMount, onBeforeUnmount } from 'vue';
import ProductCard from '@/components/product/Card.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { useNotification } from '@/composables/useNotification';
import { useProductStore } from '@/stores/product';

const showNotification = useNotification();
const productStore = useProductStore();

onBeforeMount(async () => {
  try {
    await productStore.fetchCategoriesAndProducts();
  } catch (err) {
    showNotification(err, "error");
  }
});

onBeforeUnmount(() => {
  productStore.stopAllProductsTimer();
});
</script>

<template>
  <div>
    <div class="container">
      <h1 class="page-title">TẤT CẢ SẢN PHẨM</h1>

      <LoadingSpinner v-if="productStore.isLoading" message="Đang tải sản phẩm..." />
      <div v-else-if="!productStore.isLoading && productStore.categoriesWithProducts.length === 0" class="no-products-state">
        <p>Không có sản phẩm nào để hiển thị.</p>
      </div>
      <div v-else class="products-ctn">
        <section v-for="categoryData in productStore.categoriesWithProducts" :key="categoryData.ID" class="product-section">
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
  margin: 40px auto;
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
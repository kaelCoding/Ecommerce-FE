<script setup>
import { ref, onBeforeMount } from 'vue';
import ProductCard from '@/components/product/Card.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { useNotification } from '@/composables/useNotification';
import { get_categories_api, get_products_by_category_api } from '@/services/category';

const showNotification = useNotification();
const isLoading = ref(true);

const categoriesWithProducts = ref([]);

onBeforeMount(async () => {
  await fetchData();
})

const fetchData = async () => {
  isLoading.value = true;
  try {
    const categories = await get_categories_api();
    if (!categories || categories.length === 0) return;

    const productPromises = categories.map(category =>
      get_products_by_category_api(category.ID).then(products => ({
        ...category,
        products: products
      }))
    );

    const results = await Promise.all(productPromises);
    categoriesWithProducts.value = results.filter(cat => cat.products && cat.products.length > 0);
  } catch (err) {
    console.error("Failed to fetch data for home view:", err);
    showNotification(err, "error")
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="container">
      <h1 class="page-title">TẤT CẢ SẢN PHẨM</h1>

      <LoadingSpinner v-if="isLoading" message="Đang tải sản phẩm..." />
      <div v-else-if="!isLoading && categoriesWithProducts.length === 0" class="no-products-state">
        <p>Không có sản phẩm nào để hiển thị.</p>
      </div>
      <div v-else class="products-ctn">
        <section v-for="categoryData in categoriesWithProducts" :key="categoryData.ID" class="product-section">
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
<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '@/stores/product';
import Card from '@/components/product/Card.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const productStore = useProductStore();
const { t } = useI18n();

const products = ref([]);
const categoryName = ref('');
const isLoading = ref(true); // Đặt trạng thái ban đầu là true để hiển thị spinner
const categoryExists = ref(true);

const fetchProducts = async (slug) => {
    isLoading.value = true;
    products.value = [];
    categoryExists.value = true;

    // Đảm bảo categories đã được fetch từ store
    await productStore._fetchCategoriesOnce();

    // Tìm categoryID từ slug trong danh sách đã có
    const category = productStore._categories.find(c => c.name.toLowerCase().replace(/\s/g, '-') === slug);

    if (category) {
        categoryName.value = category.name;
        // Gọi action từ store để lấy sản phẩm dựa trên category ID
        await productStore.ensureCategoryProducts(category.ID);
        // Lấy dữ liệu sản phẩm từ store
        products.value = productStore.productsByCategory[category.ID] || [];

        // Cập nhật tiêu đề trang
        document.title = `${t('category.titlePrefix')} ${category.name} | Tuni Toku`;
    } else {
        // Xử lý trường hợp không tìm thấy danh mục
        console.error(`Category with slug "${slug}" not found.`);
        categoryExists.value = false;
        products.value = [];
        categoryName.value = "Không tìm thấy";
        document.title = "Danh mục không tồn tại | Tuni Toku";
    }

    isLoading.value = false;
};

// Sử dụng watch để fetch dữ liệu mỗi khi slug trên URL thay đổi
watch(
    () => route.params.slug,
    (newSlug) => {
        if (newSlug) {
            fetchProducts(newSlug);
        }
    },
    { immediate: true }
);
</script>

<template>
  <div class="category-page-container">
    <div class="container">
      <LoadingSpinner v-if="isLoading" :message="t('common.loading')" />
      <div v-else>
        <div v-if="categoryExists">
          <h1 class="category-title">Danh mục: {{ categoryName }}</h1>
          <div v-if="products.length > 0" class="products-grid">
            <Card v-for="product in products" :key="product.ID" :product="product" />
          </div>
          <div v-else class="empty-state">
            <p>Chưa có sản phẩm nào trong danh mục này.</p>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Danh mục bạn đang tìm kiếm không tồn tại.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-page-container {
  padding-top: 100px;
  padding-bottom: 60px;
  min-height: 70vh;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.category-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  color: var(--secondary-color);
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
.empty-state {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 50px;
}
</style>
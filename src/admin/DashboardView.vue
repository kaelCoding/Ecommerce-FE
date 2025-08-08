<script setup>
import { onMounted, ref } from 'vue';
import { get_products_api } from '@/services/product';
import { get_categories_api } from '@/services/category';
import { get_users_api } from '@/services/auth';
import { useNotification } from '@/composables/useNotification';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const { showNotification } = useNotification();

const products = ref([]);
const categories = ref([]);
const users = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const [productsRes, categoriesRes, usersRes] = await Promise.all([
      get_products_api(),
      get_categories_api(),
      get_users_api()
    ]);

    products.value = productsRes;
    categories.value = categoriesRes;
    users.value = usersRes;

  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    showNotification("Không thể tải dữ liệu tổng quan.", "error")
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="content-area">
    <div class="main-header">
      <h1>Tổng Quan</h1>
    </div>

    <LoadingSpinner v-if="isLoading" message="Đang tải dữ liệu..."/>
    <div v-else class="dashboard-grid">
      <div class="stat-card">
        <h3>Sản phẩm</h3>
        <p>{{ products.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Danh mục</h3>
        <p>{{ categories.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Người dùng</h3>
        <p>{{ users.length }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-header {
  background-color: var(--white-color);
  padding: 20px 30px;
  margin-bottom: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.main-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-color);
}

.content-area {
  background-color: var(--white-color);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: var(--light-gray-color);
  padding: 20px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  color: var(--text-color);
}

.stat-card h3 {
  font-size: 1.2rem;
}

.stat-card p {
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
}
</style>
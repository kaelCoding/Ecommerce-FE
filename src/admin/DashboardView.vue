<script setup>
import { onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { useNotification } from '@/composables/useNotification';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const { showNotification } = useNotification();

const adminStore = useAdminStore();

onMounted(async () => {
  try {
    await adminStore.fetchAllDashboardData();
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    showNotification(err, "error");
  }
});
</script>

<template>
  <div class="container">
    <div class="main-header">
      <h1>Tổng Quan</h1>
    </div>

    <LoadingSpinner v-if="adminStore.isLoading.all" message="Đang tải dữ liệu..."/>
    <div v-else class="dashboard-grid content-area">
      <div class="stat-card">
        <h3>Sản phẩm</h3>
        <p>{{ adminStore.products.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Danh mục</h3>
        <p>{{ adminStore.categories.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Người dùng</h3>
        <p>{{ adminStore.users.length }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(150px, 30vw, 250px), 1fr));
  gap: clamp(15px, 3vw, 20px); 
  align-items: stretch; 
}

.stat-card {
  background-color: var(--white-color); 
  padding: clamp(15px, 4vw, 25px);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  color: var(--text-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease; 
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
}

.stat-card h3 {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  margin-bottom: clamp(5px, 1.5vw, 10px);
  color: var(--gray-color);
}

.stat-card p {
  font-size: clamp(1.8rem, 5vw, 2.5rem); 
  font-weight: 700; 
  color: var(--primary-color);
  line-height: 1.2;
}
</style>
<script setup>
import { onBeforeMount } from 'vue';
import { useAdminStore } from '@/stores/admin';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const adminStore = useAdminStore();

onBeforeMount(async () => {
  adminStore.fetchUsers
})
</script>

<template>
  <div class="container">
    <div class="main-header">
      <h1>Người Dùng</h1>
    </div>
    <div class="content-area">
      <div class="content-header">
        <h2>Danh sách Người Dùng</h2>
      </div>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Tên</th>
              <th>Quyền hạn</th>
            </tr>
          </thead>
          <LoadingSpinner v-if="adminStore.isLoading.users" message="Đang tải..." />
          <tbody v-else>
            <tr v-for="user in adminStore.users" :key="user.ID">
              <td>{{ user.id }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.admin ? 'admin' : 'user' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  overflow-y: hidden;
}
</style>
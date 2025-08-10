<script setup>
import { onBeforeMount, ref } from 'vue';
import { useNotification } from '@/composables/useNotification';
import { get_users_api } from '@/services/auth';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const { showNotification } = useNotification();
const isLoading = ref(true);

const users = ref([]);

onBeforeMount(async () => {
  await getUsers()
  isLoading.value = false
})

const getUsers = async () => {
  try {
    const res = await get_users_api();
    users.value = res;
  } catch (err) {
    console.error("Failed to get products:", err);
    showNotification(err, "error");
  }
};

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
          <LoadingSpinner v-if="isLoading" message="Đang tải..." />
          <tbody v-else>
            <tr v-for="user in users" :key="user.ID">
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

</style>
<script setup>
import { useRouter } from 'vue-router';
import { onBeforeMount } from 'vue';
import { useNotification } from '@/composables/useNotification';
import { formatPrice } from '@/composables/useUtils';
import { useAdminStore } from '@/stores/admin';
import { useConfirmation } from '@/composables/useConfirmation';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ConfirmationModal from '@/components/common/ConfirmationModal.vue';

const { showNotification } = useNotification();
const router = useRouter();
const adminStore = useAdminStore();

const { 
  isConfirmModalVisible, 
  showConfirmModal: handleDeleteProduct,
  cancelDelete, 
  confirmDelete: performDelete
} = useConfirmation(async (id) => {
  try {
    await adminStore.deleteProduct(id);
    showNotification("Xóa sản phẩm thành công!");
  } catch (err) {
    console.error("Failed to delete product:", err);
    showNotification(err.message || err, "error");
  }
});

onBeforeMount(async () => {
  await adminStore.fetchProducts();
});

const goToEditProduct = (productId) => {
  router.push({ name: 'admin-products-edit', params: { id: productId } });
};
</script>

<template>
  <div class="container">
    <div class="main-header">
      <h1>Sản Phẩm</h1>
    </div>
    <div class="content-area">
      <div class="content-header">
        <h2>Danh sách Sản Phẩm</h2>
        <button class="btn btn-primary" @click="router.push({ name: 'admin-products-new' })">
          <i class="fas fa-plus"></i> Thêm Mới
        </button>
      </div>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <LoadingSpinner v-if="adminStore.isLoading.products" message="Đang tải..." />
          <tbody v-else>
            <tr v-for="product in adminStore.products" :key="product.ID">
              <td>
                <img v-if="product.image_urls && product.image_urls.length > 0" :src="product.image_urls[0]"
                  :alt="product.name" class="table-img">
              </td>
              <td>{{ product.name }}</td>
              <td>{{ product.category_name }}</td>
              <td>{{ formatPrice(product.price) }}</td>
              <td>
                <div class="table-actions center">
                  <button class="btn-primary" @click="goToEditProduct(product.ID)">
                    <i class="fas fa-edit"></i> <span>Sửa</span>
                  </button>
                  <button class="btn-primary" @click="handleDeleteProduct(product.ID)">
                    <i class="fas fa-trash"></i> <span>Xóa</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ConfirmationModal :show="isConfirmModalVisible" title="Xác nhận xóa sản phẩm"
      message="Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác." @confirm="performDelete"
      @cancel="cancelDelete" />
  </div>
</template>

<style scoped></style>
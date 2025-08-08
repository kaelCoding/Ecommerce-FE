<script setup>
import { useRouter } from 'vue-router';
import { get_categories_api, delete_category_api } from '@/services/category';
import { onBeforeMount, ref } from 'vue';
import { useNotification } from '@/composables/useNotification';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ConfirmationModal from '@/components/common/ConfirmationModal.vue';

const { showNotification } = useNotification();
const router = useRouter();
const isLoading = ref(true)

const isConfirmModalVisible = ref(false);
const categoryIdToDelete = ref(null); 

const categorys = ref([])

onBeforeMount(async () => {
  await getCategory()
  isLoading.value = false
})

const getCategory = async () => {
  try {
    const res = await get_categories_api();
    categorys.value = res;
  } catch (error) {
    console.error("Failed to get categorys:", error);
    showNotification("Tải danh sách danh mục thất bại.", "error");
  }
}

const goToEditCategory = (categoryId) => {
  router.push({ name: 'admin-categories-edit', params: { id: categoryId } });
};

const handleDeleteCategory = (categoryId) => {
  categoryIdToDelete.value = categoryId;
  isConfirmModalVisible.value = true; 
};

const confirmDelete = async () => {
  isConfirmModalVisible.value = false;
  if (!categoryIdToDelete.value) return;

  try {
    await delete_category_api(categoryIdToDelete.value);
    categorys.value = categorys.value.filter(category => category.ID !== categoryIdToDelete.value);
    showNotification("Xóa danh mục thành công!");
  } catch (error) {
    console.error("Failed to delete category:", error);
    showNotification("Xóa danh mục thất bại. Vui lòng thử lại.", "error");
  } finally {
    categoryIdToDelete.value = null;
  }
};

const cancelDelete = () => {
  isConfirmModalVisible.value = false;
  categoryIdToDelete.value = null;
};
</script>

<template>
  <div>
    <div class="main-header">
      <h1>Danh Mục</h1>
    </div>
    <div class="content-area">
      <div class="content-header">
        <h2>Danh sách Danh Mục</h2>
        <button class="btn btn-primary" @click="router.push({ name: 'admin-categories-new' })">
          <i class="fas fa-plus"></i> Thêm Mới
        </button>
      </div>
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Danh Mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <LoadingSpinner v-if="isLoading" message="Đang tải..."/>
          <tbody v-else>
            <tr v-for="category in categorys" :key="category.id">
              <td>{{ category.ID }}</td>
              <td>{{ category.name }}</td>
              <td>
                <div class="table-actions center">
                  <button class="btn-primary" @click="goToEditCategory(category.ID)">
                    <i class="fas fa-edit"></i> <span>Sửa</span>
                  </button>
                  <button class="btn-primary" @click="handleDeleteCategory(category.ID)">
                    <i class="fas fa-trash"></i> <span>Xóa</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ConfirmationModal :show="isConfirmModalVisible" title="Xác nhận xóa danh mục"
      message="Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác." @confirm="confirmDelete"
      @cancel="cancelDelete" />
  </div>
</template>

<style scoped>
th,
td {
  text-align: center;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

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
}

.content-area {
  background-color: var(--white-color);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-header h2 {
  font-size: 1.5rem;
}

.btn-primary {
  width: auto !important;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th,
.admin-table td {
  padding: 15px;
  border-bottom: 1px solid #E5E7EB;
  vertical-align: middle;
}

.admin-table th {
  font-weight: 600;
  background-color: var(--light-gray-color);
}

.table-actions {
  display: flex;
  gap: 10px;
}

.table-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary-color);
  font-size: 1rem;
}

.text-right {
  text-align: right;
}

@media (max-width: 992px) {
  .main-header {
    padding: 15px 20px;
    margin-bottom: 20px;
  }

  .main-header h1 {
    font-size: 1.5rem;
  }

  .content-area {
    padding: 20px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .content-header h2 {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .main-header h1 {
    font-size: 1.2rem;
  }

  .content-header h2 {
    font-size: 1rem;
  }

  .admin-table th,
  .admin-table td {
    padding: 10px;
    font-size: 0.9rem;
  }

  .table-img {
    width: 40px;
    height: 40px;
  }

  .btn-primary {
    padding: 8px 12px !important;
    font-size: 0.8rem;
  }

  .content-header .btn-primary {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {

  .admin-table th,
  .admin-table td {
    font-size: 0.8rem;
  }

  .table-actions button span {
    display: none;
  }
}
</style>
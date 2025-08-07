<script setup>
import { useRouter } from 'vue-router';
import { onBeforeMount, ref } from 'vue';
import { get_products_api } from '@/services/product';
import { delete_product_api } from '@/services/product';
import { useNotification } from '@/composables/useNotification';
import { formatPrice } from '@/composables/useUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ConfirmationModal from '@/components/common/ConfirmationModal.vue';

const { showNotification } = useNotification();
const router = useRouter();
const isLoading = ref(true);

const isConfirmModalVisible = ref(false);
const productIdToDelete = ref(null);  

const products = ref([]);

onBeforeMount(async () => {
  await getProducts()
  isLoading.value = false
})

const getProducts = async () => {
  try {
    const res = await get_products_api();
    products.value = res;
  } catch (error) {
    console.error("Failed to get products:", error);
    showNotification("Tải danh sách sản phẩm thất bại.", "error");
  }
};

const goToEditProduct = (productId) => {
  router.push({ name: 'admin-products-edit', params: { id: productId } });
};

const handleDeleteProduct = (productId) => {
  productIdToDelete.value = productId;
  isConfirmModalVisible.value = true; 
};

const confirmDelete = async () => {
  isConfirmModalVisible.value = false;
  if (!productIdToDelete.value) return;

  try {
    await delete_product_api(productIdToDelete.value);
    products.value = products.value.filter(product => product.ID !== productIdToDelete.value);
    showNotification("Xóa sản phẩm thành công!");
  } catch (error) {
    console.error("Failed to delete product:", error);
    showNotification("Xóa sản phẩm thất bại. Vui lòng thử lại.", "error");
  } finally {
    productIdToDelete.value = null;
  }
};

const cancelDelete = () => {
  isConfirmModalVisible.value = false;
  productIdToDelete.value = null;
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
              <!-- <th>Kho hàng</th> -->
              <th>Hành động</th>
            </tr>
          </thead>
          <LoadingSpinner v-if="isLoading" message="Đang tải..." />
          <tbody v-else>
            <tr v-for="product in products" :key="product.ID">
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
      message="Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác." @confirm="confirmDelete"
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

.table-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid black;
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

  .admin-table th:nth-child(3),
  .admin-table td:nth-child(3),
  .admin-table th:nth-child(4),
  .admin-table td:nth-child(4) {
    display: none;
  }
}
</style>
<script setup>
import { ref, onMounted } from 'vue';
import { getAllOrdersApi, updateShippingCodeApi } from '@/services/admin'; 
import { useNotification } from '@/composables/useNotification';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const orders = ref([]);
const isLoading = ref(false);
const shippingCodes = ref({});
const { showNotification } = useNotification();

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const data = await getAllOrdersApi();
    orders.value = data || [];
    if (Array.isArray(data)) {
      data.forEach(order => {
        shippingCodes.value[order.ID] = order.shippingCode || '';
      });
    }
  } catch (error) {
    showNotification("Lỗi khi tải danh sách đơn hàng", "error");
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateShippingCode = async (orderId) => {
  const code = shippingCodes.value[orderId];
  if (!code) {
    showNotification("Vui lòng nhập mã vận đơn.", "warning");
    return;
  }
  try {
    await updateShippingCodeApi(orderId, code);
    showNotification("Cập nhật mã vận đơn thành công!", "success");
    const order = orders.value.find(o => o.ID === orderId);
    if (order) {
        order.shippingCode = code;
    }
  } catch (error) {
    showNotification(error || "Cập nhật thất bại", "error");
  }
};

onMounted(fetchOrders);
</script>

<template>
  <div class="container">
    <div class="main-header">
      <h1>Quản lý Đơn Hàng</h1>
    </div>
    <div class="content-area">
      <div class="content-header">
        <h2>Danh sách Đơn hàng</h2>
      </div>
       <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách Hàng</th>
              <th class="optional-col">Tổng Tiền</th>
              <th class="optional-col">Ngày Đặt</th>
              <th>Trạng thái Quay</th>
              <th>Mã Vận Đơn</th>
            </tr>
          </thead>
           <LoadingSpinner v-if="isLoading" message="Đang tải đơn hàng..." />
          <tbody v-else>
             <tr v-if="!orders || orders.length === 0">
                <td colspan="6" style="text-align: center; padding: 2rem;">Chưa có đơn hàng nào.</td>
            </tr>
            <tr v-for="order in orders" :key="order.ID">
              <td>{{ order.ID }}</td>
              <td>{{ order.customerName }}</td>
              <td class="optional-col">{{ new Intl.NumberFormat('vi-VN').format(order.totalAmount) }}đ</td>
              <td class="optional-col">{{ new Date(order.CreatedAt).toLocaleDateString('vi-VN') }}</td>
              <td>
                <span :class="order.hasSpun ? 'status-spun' : 'status-unspun'">
                  {{ order.hasSpun ? 'Đã quay' : 'Chưa quay' }}
                </span>
              </td>
              <td>
                <div class="shipping-code-cell">
                  <input 
                    type="text" 
                    v-model="shippingCodes[order.ID]"
                    placeholder="Nhập mã..."
                    :disabled="order.hasSpun"
                  />
                  <button 
                    @click="handleUpdateShippingCode(order.ID)" 
                    class="save-btn"
                    :disabled="order.hasSpun"
                  >
                    Lưu
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shipping-code-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shipping-code-cell input {
  width: 120px;
  padding: 6px;
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: var(--border-radius);
  background-color: var(--light-gray-color);
  color: var(--text-color);
}

.save-btn {
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-speed) ease;
}

.save-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.status-spun {
  color: #10b981;
  font-weight: 600;
}

.status-unspun {
  color: #f59e0b;
  font-weight: 600;
}

@media (max-width: 767px) {
  .optional-col {
    display: none;
  }
}
</style>
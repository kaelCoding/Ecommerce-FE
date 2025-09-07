<script setup>
import { onMounted, ref } from 'vue';
import { useSpinStore } from '@/stores/spin';
import { useRouter } from 'vue-router';
import { useConfirmation } from '@/composables/useConfirmation';
import { formatPrice } from '@/composables/useUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ConfirmationModal from '@/components/common/ConfirmationModal.vue';

const spinStore = useSpinStore();
const router = useRouter();

const rewardIdToDelete = ref(null);

const { 
  isConfirmModalVisible, 
  showConfirmModal,
  cancelDelete, 
} = useConfirmation();

const handleDeleteClick = (id) => {
  rewardIdToDelete.value = id;
  showConfirmModal(); 
};

const performDelete = async () => {
  if (rewardIdToDelete.value === null) return;
  try {
    await spinStore.deleteReward(rewardIdToDelete.value);
  } catch (err) {
    console.error("Failed to delete reward:", err);
  } finally {
    rewardIdToDelete.value = null;
  }
};

const goToEdit = (id) => {
    router.push({ name: 'admin-rewards-edit', params: { id } });
};

onMounted(() => {
    spinStore.fetchRewards();
});
</script>

<template>
    <div class="container">
        <div class="main-header">
            <h1>Phần Thưởng Vòng Quay</h1>
        </div>
        <div class="content-area">
            <div class="content-header">
                <h2>Danh sách Phần thưởng</h2>
                <router-link :to="{ name: 'admin-rewards-new' }" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Thêm Mới
                </router-link>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th class="optional-col">Giá trị</th>
                            <th>SL</th>
                            <th>Tỉ lệ</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody v-if="!spinStore.isLoading.all">
                        <tr v-if="!spinStore.rewards || spinStore.rewards.length === 0">
                            <td colspan="5" style="text-align: center; padding: 2rem;">Chưa có phần thưởng nào.</td>
                        </tr>
                        <tr v-else v-for="reward in spinStore.rewards" :key="reward.ID">
                            <td>{{ reward.name }}</td>
                            <td class="optional-col">{{ formatPrice(reward.value) }}</td>
                            <td>{{ reward.quantity === -1 ? '∞' : reward.quantity }}</td>
                            <td>{{ (reward.probability * 100).toFixed(1) }}%</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn-primary" @click="goToEdit(reward.ID)">
                                        <i class="fas fa-edit"></i> <span>Sửa</span>
                                    </button>
                                    <button class="btn-primary" @click="handleDeleteClick(reward.ID)">
                                        <i class="fas fa-trash"></i> <span>Xóa</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                 <LoadingSpinner v-if="spinStore.isLoading.all" message="Đang tải..." />
            </div>
        </div>
        <ConfirmationModal 
            :show="isConfirmModalVisible" 
            title="Xác nhận xóa phần thưởng"
            message="Bạn có chắc chắn muốn xóa phần thưởng này không? Hành động này không thể hoàn tác." 
            @confirm="performDelete"
            @cancel="cancelDelete" />
    </div>
</template>

<style scoped>
@media (max-width: 767px) {
    .optional-col {
        display: none;
    }
}
</style>
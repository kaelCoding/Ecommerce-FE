<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'; // Thêm watch
import { useRoute, useRouter } from 'vue-router';
import { useSpinStore } from '@/stores/spin';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const spinStore = useSpinStore();
const isLoading = ref(false);

const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'Chỉnh sửa Phần Thưởng' : 'Thêm Phần Thưởng Mới');
const submitButtonText = computed(() => isEditing.value ? 'Cập Nhật' : 'Thêm Mới');

const reward = reactive({
  id: null,
  name: '',
  value: '',
  quantity: -1,
  probability: 0.1,
});

const fetchAndSetRewardData = async (rewardId) => {
  Object.assign(reward, { id: null, name: '', value: '', quantity: -1, probability: 0.1 });

  if (!rewardId) {
    return;
  }
  
  isLoading.value = true;
  try {
    if (spinStore.rewards.length === 0) {
      await spinStore.fetchRewards(); 
    }
    
    const numericId = Number(rewardId);
    const fetchedReward = spinStore.rewards.find(r => r.ID === numericId);
    
    if (fetchedReward) {
      reward.id = fetchedReward.ID;
      reward.name = fetchedReward.name;
      reward.value = fetchedReward.value;
      reward.quantity = fetchedReward.quantity;
      reward.probability = fetchedReward.probability;
    } else {
      router.push({ name: 'admin-rewards' });
    }
  } catch (err) {
      console.error("Failed to fetch reward data:", err);
      router.push({ name: 'admin-rewards' });
  } finally {
    isLoading.value = false;
  }
};

watch(() => route.params.id, (newId) => {
    fetchAndSetRewardData(newId);
}, { immediate: true });


const handleSubmit = async () => {
  isLoading.value = true;
  const payload = {
    name: reward.name,
    value: String(reward.value),
    quantity: Number(reward.quantity),
    probability: Number(reward.probability),
  };

  try {
    if (isEditing.value) {
      await spinStore.updateReward(reward.id, payload);
    } else {
      await spinStore.addReward(payload);
    }
    router.push({ name: 'admin-rewards' });
  } catch (err) {
    console.error("Submit failed:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container">
    <div class="main-header">
      <h1>{{ pageTitle }}</h1>
    </div>
    <div class="content-area">
      <LoadingSpinner v-if="isLoading" message="Đang xử lý..." />
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Tên phần thưởng</label>
          <input type="text" id="name" class="form-input" v-model="reward.name" placeholder="Vd: Voucher giảm 10k" required>
        </div>
        
        <div class="form-group">
            <label for="value">Giá trị</label>
            <input type="text" id="value" class="form-input" v-model="reward.value" placeholder="Vd: 10000 hoặc freeship39k" required>
        </div>
        <div class="form-group">
            <label for="quantity">Số lượng (-1 là không giới hạn)</label>
            <input type="number" id="quantity" class="form-input" v-model.number="reward.quantity" required>
        </div>
        <div class="form-group">
            <label for="probability">Tỉ lệ (0.1 = 10%)</label>
            <input type="number" id="probability" class="form-input" v-model.number="reward.probability" step="0.01" min="0" max="1" required>
        </div>

        <div class="form-actions">
          <button type="button" class="btn" @click="router.back()">Hủy</button>
          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ submitButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
input[type="number"].form-input {
  padding-right: 20px;
}
</style>
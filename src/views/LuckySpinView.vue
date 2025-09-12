<script setup>
import { ref } from 'vue';
import { useSpinStore } from '@/stores/spin';
import { formatPrice } from '@/composables/useUtils';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const spinStore = useSpinStore();
const shippingCode = ref('');
const reward = ref(null);

const handleSpin = async () => {
  reward.value = null; 
  const result = await spinStore.spinWheel(shippingCode.value);
  if (result) {
    reward.value = result;
  }
};

const resetSpin = () => {
    shippingCode.value = '';
    reward.value = null;
};
</script>

<template>
  <div class="lucky-spin-container">
    <div class="spin-card">
      <div class="spin-card-header">
        <h2 class="spin-title">{{ t('luckySpin.spinTitle') }}</h2>
        <p class="spin-subtitle">{{ t('luckySpin.spinSubtitle') }}</p>
      </div>
      
      <div class="spin-card-body">
        <div v-if="!reward" class="input-section">
          <input 
            v-model="shippingCode" 
            type="text" 
            class="spin-input"
            :placeholder="t('luckySpin.placeholder')"
            :disabled="spinStore.isLoading.spin"
          />
          <button 
            @click="handleSpin" 
            :disabled="!shippingCode || spinStore.isLoading.spin"
            class="btn-primary"
          >
            <span v-if="spinStore.isLoading.spin">
              <i class="fas fa-spinner fa-spin"></i> {{ t('luckySpin.loading') }}
            </span>
            <span v-else>{{ t('luckySpin.spin') }}</span>
          </button>
        </div>

        <div v-if="reward" class="result-section">
          <h3>{{ t('luckySpin.reward') }}</h3>
          <div class="reward-info">
            <p class="reward-name">{{ reward.name }}</p>
            <p v-if="reward.value" class="reward-value"> {{ t('luckySpin.reward-value') }} {{ formatPrice(reward.value) }}</p>
          </div>
          <button @click="resetSpin" class="btn-primary">{{ t('luckySpin.btn') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lucky-spin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 72px);
  padding: 2rem 1rem;
  background: var(--light-gray-color);
}

.spin-card {
  background: var(--white-color);
  padding: clamp(1.5rem, 5vw, 2.5rem);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  text-align: center;
  width: 100%;
  max-width: 500px;
  border-top: 4px solid var(--primary-color);
  transition: all var(--transition-speed) ease;
}

.spin-title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.spin-subtitle {
  color: var(--text-color);
  margin-bottom: 2rem;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.spin-input {
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color, #E5E7EB);
  border-radius: var(--border-radius);
  background: var(--light-gray-color);
  color: var(--text-color);
  font-size: 1rem;
  transition: all var(--transition-speed) ease;
}

.spin-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.result-section {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-section h3 {
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.reward-info {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background-color: var(--light-gray-color);
  border-radius: var(--border-radius);
}

.reward-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.reward-value {
  color: var(--text-color);
  margin-top: 0.25rem;
}
</style>
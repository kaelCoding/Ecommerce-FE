<script setup>
import { ref, watch, nextTick } from 'vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { formatPrice } from '@/composables/useUtils';

const props = defineProps({
  isActive: Boolean,
  results: Array,
  isLoading: Boolean,
  modelValue: String, 
});

const emit = defineEmits(['close', 'update:modelValue']);

const searchInput = ref(null);

watch(() => props.isActive, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});
</script>

<template>
  <transition name="fade">
    <div v-if="isActive" class="search-overlay-wrapper" @click.self="emit('close')">
      <transition name="slide-down">
        <div v-if="isActive" class="search-results-container">
          <div class="search-input-header">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              ref="searchInput"
              type="text" 
              class="search-input" 
              placeholder="Tìm kiếm sản phẩm bạn muốn..."
              :value="modelValue" 
              @input="emit('update:modelValue', $event.target.value)"
            />
            <button class="close-btn" @click="emit('close')">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div class="results-content">
            <LoadingSpinner v-if="isLoading" message="Đang tìm kiếm..." />
            <div v-else-if="results.length > 0" class="results-list">
              <RouterLink 
                v-for="product in results" 
                :key="product.ID" 
                :to="`/products/detail/${product.ID}`"
                class="result-item" 
                @click="emit('close')"
              >
                <img :src="product.image_urls[0]" :alt="product.name" class="result-item-image" />
                <div class="result-item-info">
                  <h4 class="result-item-name">{{ product.name }}</h4>
                  <p class="result-item-price">{{ formatPrice(product.price) }}</p>
                </div>
              </RouterLink>
            </div>
            <div v-else-if="modelValue && modelValue.length > 1 && !isLoading" class="empty-state">
              <p>Không tìm thấy kết quả nào cho "<strong>{{ modelValue }}</strong>".</p>
            </div>
            <div v-else class="empty-state">
              <i class="fa-solid fa-keyboard empty-icon"></i>
              <p>Nhập từ khoá để tìm sản phẩm.</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.search-overlay-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 82px; 
}

.search-results-container {
  width: 100%;
  max-width: 600px;
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-lg);
  display: flex;
  flex-direction: column;
}

.search-input-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid var(--light-gray-color);
  gap: 10px;
}

.search-icon {
  color: var(--gray-color);
}

.search-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 8px 0;
  background-color: transparent;
}

.results-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--gray-color);
}
.empty-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #d1d5db;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
  text-decoration: none;
  border-bottom: 1px solid black;
}
.result-item:hover {
  background-color: var(--light-gray-color);
}

.result-item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid var(--light-gray-color);
}

.result-item-info {
  flex-grow: 1;
}
.result-item-name {
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 4px;
}
.result-item-price {
  font-size: 0.9rem;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .search-overlay-wrapper {
    padding-top: 0; 
    align-items: stretch;
    z-index: 101;
  }
  .search-results-container {
    max-width: 100%;
    height: 100%;
    border-radius: 0;
    max-height: 100vh;
  }
  .slide-down-enter-from,
  .slide-down-leave-to {
    transform: translateY(0); 
  }
  .results-content {
    max-height: calc(100vh - 65px);
  }
}
</style>
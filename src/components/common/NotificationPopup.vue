<script setup>
import { useNotification } from '@/composables/useNotification';

const { notification } = useNotification();
</script>

<template>
  <transition name="toast-fade">
    <div v-if="notification.show" class="toast-popup" :class="`toast--${notification.type}`">
      <i v-if="notification.type === 'success'" class="fas fa-check-circle"></i>
      <i v-if="notification.type === 'error'" class="fas fa-exclamation-circle"></i>
      <span>{{ notification.message }}</span>
    </div>
  </transition>
</template>

<style scoped>
.toast-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: var(--border-radius, 8px);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  z-index: 200;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.toast--success {
  background-color: #4CAF50; 
}

.toast--error {
  background-color: #F44336; 
}
</style>
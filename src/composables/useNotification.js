import { ref, readonly } from 'vue';

const notification = ref({
  show: false,
  message: '',
  type: 'success', // 'success' or 'error'
});

let timeoutId = null;

const showNotification = (message, type = 'success', duration = 3000) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  notification.value = {
    show: true,
    message,
    type,
  };

  timeoutId = setTimeout(() => {
    notification.value.show = false;
  }, duration);
};

export function useNotification() {
  return {
    notification: readonly(notification), 
    showNotification,
  };
}
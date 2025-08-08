<script setup>
import { ref } from 'vue';
import { send_feedback_api } from '@/services/order';
import LoadingSpinner from './LoadingSpinner.vue';
import { useNotification } from '@/composables/useNotification';

const { showNotification } = useNotification();

const userName = ref('');
const userEmail = ref('');
const feedback = ref('');
const isLoading = ref(false);
const isSubmitted = ref(false)

const submitFeedback = async () => {
    isLoading.value = true;

    const feedbackData = {
        userName: userName.value,
        userEmail: userEmail.value,
        feedback: feedback.value,
    };

    try {
        await send_feedback_api(feedbackData);
        isSubmitted.value = true;

        userName.value = '';
        userEmail.value = '';
        feedback.value = '';

    } catch (error) {
        console.error("Failed to send feedback:", error);
        const errorMessage = error.message || "Gửi góp ý thất bại. Vui lòng thử lại sau.";
        showNotification(errorMessage, "error");
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
  <div class="feedback-form-container">
    <h3 class="feedback-title">Hãy cho chúng tôi biết cảm nhận của bạn!</h3>
    <p class="feedback-subtitle">Góp ý của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.</p>

    <form @submit.prevent="submitFeedback" v-if="!isSubmitted" class="feedback-form">
      <div class="form-group">
        <label for="name">Tên của bạn</label>
        <input type="text" id="name" v-model="userName" required placeholder="Nhập tên của bạn">
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="userEmail" required placeholder="Nhập email của bạn">
      </div>

      <div class="form-group">
        <label for="feedback">Nội dung góp ý</label>
        <textarea id="feedback" v-model="feedback" required rows="4" placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm/dịch vụ của chúng tôi..."></textarea>
      </div>

      <button type="submit" class="btn-primary" :disabled="isLoading">
        <loading-spinner v-if="isLoading" message="Đang gửi..."/>
        <span v-else>Gửi góp ý</span>
      </button>
    </form>
    <div v-else class="thank-you-message">
        <h4>Cảm ơn bạn!</h4>
        <p>Góp ý của bạn đã được gửi đi thành công.</p>
    </div>
  </div>
</template>

<style scoped>
.feedback-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  background-color: var(--light-gray-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: background-color var(--transition-speed), transform 0.5s ease;
  animation: fadeInUp 1s ease-in-out;
}

.feedback-form-container.submitted {
  transform: scale(0.95);
  opacity: 0.8;
}

.feedback-title {
  text-align: center;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 10px;
}

.feedback-subtitle {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-color);
  font-size: clamp(0.875rem, 2vw, 1rem);
}

input,
textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: var(--border-radius);
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  background-color: var(--white-color);
  color: var(--text-color);
  transition: border-color var(--transition-speed), background-color var(--transition-speed);
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

textarea {
  resize: vertical;
}

.btn-primary {
  padding: 12px 24px;
}

html[data-theme="dark"] .feedback-form-container {
  background-color: var(--light-gray-color);
  box-shadow: var(--box-shadow);
}

html[data-theme="dark"] .feedback-title,
html[data-theme="dark"] .feedback-subtitle,
html[data-theme="dark"] label {
  color: var(--secondary-color);
}

html[data-theme="dark"] input,
html[data-theme="dark"] textarea {
  background-color: #4b5563;
  border-color: #6b7280;
  color: var(--secondary-color);
}

html[data-theme="dark"] .success-message {
  background-color: #1f2d22;
  color: #bbf7d0;
  border-color: #2e4c36;
}

@media (max-width: 768px) {
  .feedback-form-container {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .feedback-form {
    gap: 15px;
  }
  
  label {
    margin-bottom: 5px;
  }
  
  input,
  textarea {
    padding: 10px;
  }
  
  .btn-primary {
    padding: 10px 20px;
  }
}
</style>
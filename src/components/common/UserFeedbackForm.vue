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

        showNotification("Cảm ơn bạn! Góp ý của bạn đã được gửi đi thành công.")
    } catch (err) {
        console.error("Failed to send feedback:", err);
        showNotification(err, "error");
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
  <div class="form-container">
    <h3 class="form-title">Hãy cho chúng tôi biết cảm nhận của bạn !</h3>
    <p class="form-subtitle">Góp ý của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.</p>

    <loading-spinner v-if="isLoading" message="Đang gửi..."/>
    <form @submit.prevent="submitFeedback" v-else>
      <div class="form-group">
        <label for="name">Tên của bạn</label>
        <input class="form-input" type="text" id="name" v-model="userName" required placeholder="Nhập tên của bạn">
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input class="form-input" type="email" id="email" v-model="userEmail" required placeholder="Nhập email của bạn">
      </div>

      <div class="form-group">
        <label for="feedback">Nội dung góp ý</label>
        <textarea class="form-input" id="feedback" v-model="feedback" required rows="4" placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm/dịch vụ của chúng tôi..."></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span>Gửi góp ý</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container.submitted {
  transform: scale(0.95);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }
}

@media (max-width: 480px) {
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
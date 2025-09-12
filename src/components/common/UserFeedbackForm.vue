<script setup>
import { ref } from 'vue';
import { send_feedback_api } from '@/services/order';
import { useNotification } from '@/composables/useNotification';
import { get_auth_user } from '@/stores/auth';
import { useRouter } from 'vue-router';
import LoadingSpinner from './LoadingSpinner.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { showNotification } = useNotification();
const router = useRouter();

const feedback = ref('');
const isLoading = ref(false);
const isSubmitted = ref(false)

const submitFeedback = async () => {
  if (!get_auth_user.value) {
    router.push("/login")
    showNotification("Bạn cần đăng nhập để gửi góp ý!", "error")
  }
  isLoading.value = true;

  const feedbackData = {
    userName: get_auth_user.value.username,
    userEmail: get_auth_user.value.email,
    feedback: feedback.value,
  };

  try {
    await send_feedback_api(feedbackData);
    isSubmitted.value = true;

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
    <h3 class="form-title">{{ t('feedback.formTitle') }}</h3>
    <p class="form-subtitle">{{ t('feedback.formSubtitle') }}</p>

    <LoadingSpinner v-if="isLoading" :message="t('feedback.loading')" />
    <form @submit.prevent="submitFeedback" v-else>
      <div class="form-group">
        <label for="feedback">{{ t('feedback.content') }}</label>
        <textarea class="form-input" id="feedback" v-model="feedback" required rows="4"
          :placeholder="t('feedback.placeholder')"></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span>{{ t('feedback.submit') }}</span>
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
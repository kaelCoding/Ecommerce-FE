<script setup>
import { ref } from "vue"
import { get_auth_info, save_token_local } from "@/stores/auth";
import { useRoute, useRouter } from "vue-router"
import { auth_login_api } from "@/services/auth";
import { useNotification } from "@/composables/useNotification";

const { showNotification } = useNotification();

const router = useRouter()
const route = useRoute()

const dataLogin = ref({
  email: "",
  password: "",
})

const login = async () => {
  try {
    const data = await auth_login_api(dataLogin.value)
    save_token_local(data.token)
    await get_auth_info()

    showNotification("Đăng nhập thành công.")
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (err) {
    showNotification(err, "error")
  }
}
</script>

<template>
  <div class="container">
    <div class="form-container">
      <h1 class="form-title">Đăng nhập</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="dataLogin.email" type="text" class="form-input" id="email" placeholder="Enter email"
            required>
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input v-model="dataLogin.password" type="password" class="form-input" id="password" placeholder="••••••••"
            required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Đăng nhập</button>
        </div>
        <p class="form-switch-text">
          <span>Chưa có tài khoản?</span> 
          <router-link to="/register"> Đăng ký ngay</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>
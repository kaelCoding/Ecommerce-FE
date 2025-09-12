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
      <h1 class="form-title">LOGIN</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="dataLogin.email" type="text" class="form-input" id="email" placeholder="your@email.com"
            required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input v-model="dataLogin.password" type="password" class="form-input" id="password" placeholder="••••••••"
            required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Login</button>
        </div>
        <p class="form-switch-text">
          Don't have an account ?<router-link to="/register"> Register</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
</style>
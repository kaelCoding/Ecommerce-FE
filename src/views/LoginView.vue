<script setup>
import { ref } from "vue"
import { get_auth_info, save_token_local, get_auth_user } from "@/stores/auth";
import { useRoute, useRouter } from "vue-router"
import { auth_login_api } from "@/services/auth";

const router = useRouter()
const route = useRoute()

const dataLogin = ref({
    username: "",
    password: "",
})

const login = async () => {
    try {
        const data = await auth_login_api(dataLogin.value)
        save_token_local(data.token)
        // get_auth_user.value = data
        await get_auth_info()

        const redirectPath = route.query.redirect || '/admin';
        router.push(redirectPath)
    } catch (error) {
        console.log('on login error ', error)
    }
}
</script>

<template>
  <div class="login-view">
    <div class="form-container">
      <h1 class="form-title">Đăng nhập</h1>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="name">Name</label>
          <input v-model="dataLogin.username" type="text" id="name" class="form-input" placeholder="Enter name" required>
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input v-model="dataLogin.password" type="password" id="password" class="form-input" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-primary">Đăng nhập</button>
        <p class="form-switch-text">
          Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-switch-text {
  text-align: center;
  margin-top: 20px;
  color: var(--text-color);
}

.form-switch-text a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
}

.form-switch-text a:hover {
  text-decoration: underline;
}
</style>
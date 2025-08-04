<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { auth_register_api } from "@/services/auth";

const router = useRouter()

const dataRegister = ref({
    username: "",
    email: "",
    password: "",
})

const register = async () => {
    try {
        await auth_register_api(dataRegister.value).then(res => {
            router.push("/login")
        })
    } catch (error) {
        console.log(error)
    }
}
</script>

<template>
  <div class="register-view">
    <div class="form-container">
      <h1 class="form-title">Đăng ký</h1>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="fullname">Họ và tên</label>
          <input v-model="dataRegister.username" type="text" id="fullname" class="form-input" placeholder="Nguyễn Văn A" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="dataRegister.email" type="email" id="email" class="form-input" placeholder="your@email.com" required>
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input v-model="dataRegister.password" type="password" id="password" class="form-input" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-primary">Tạo tài khoản</button>
        <p class="form-switch-text">
          Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
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
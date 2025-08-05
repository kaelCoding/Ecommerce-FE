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
  <div>
    <div class="form-container">
      <h1 class="form-title">Đăng ký</h1>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="fullname">Họ và tên</label>
          <input v-model="dataRegister.username" type="text" id="fullname" placeholder="Nguyễn Văn A"
            required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="dataRegister.email" type="email" id="email" placeholder="your@email.com"
            required>
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input v-model="dataRegister.password" type="password" id="password" placeholder="••••••••"
            required>
        </div>
        <button type="submit" class="btn-primary">Tạo tài khoản</button>
        <p class="form-switch-text">
          Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>
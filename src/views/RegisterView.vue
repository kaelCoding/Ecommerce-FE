<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { auth_register_api } from "@/services/auth";
import { useNotification } from "@/composables/useNotification";

const { showNotification } = useNotification();

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
    showNotification("Đăng ký thành công.")
  } catch (err) {
    console.log(err)
    showNotification(err, "error")
  }
}
</script>

<template>
  <div>
    <div class="form-container">
      <h1 class="form-title">REGISTER</h1>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="fullname">Name</label>
          <input class="form-input" v-model="dataRegister.username" type="text" id="fullname" placeholder="your name"
            required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input class="form-input" v-model="dataRegister.email" type="email" id="email" placeholder="your@email.com"
            required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input class="form-input" v-model="dataRegister.password" type="password" id="password" placeholder="••••••••"
            required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Register</button>
        </div>
        <p class="form-switch-text">
          Have an account ? <router-link to="/login">Login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>
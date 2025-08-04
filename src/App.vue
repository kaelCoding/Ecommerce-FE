<script setup>
import Navbar from './components/layouts/Navbar.vue'; // Đảm bảo đường dẫn chính xác
import Footer from './components/layouts/Footer.vue';
</script>

<template>
  <div id="app">
    <Navbar />
    <main class="page-wrapper">
      <router-view />
    </main>
    <Footer/>
  </div>
</template>


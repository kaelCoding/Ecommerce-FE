<script setup>
import Navbar from './components/layouts/Navbar.vue';
import Footer from './components/layouts/Footer.vue';
import NotificationPopup from './components/common/NotificationPopup.vue';
</script>

<template>
  <div id="app">
    <Navbar />
    <main class="page-wrapper">
      <router-view />
    </main>
    <Footer/>
    <NotificationPopup />
  </div>
</template>


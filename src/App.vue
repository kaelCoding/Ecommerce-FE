<script setup>
import Navbar from './components/layouts/Navbar.vue';
import Footer from './components/layouts/Footer.vue';
import NotificationPopup from './components/common/NotificationPopup.vue';
import { useTheme } from './composables/useTheme';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const shouldShowFooter = computed(() =>
  !route.path.startsWith('/admin') &&
  !route.path.startsWith('/chat') &&
  !route.path.startsWith('/profile') &&
  !route.path.startsWith('/lucky-spin') &&
  !route.path.startsWith('/products/detail') &&
  route.path !== '/login' &&
  route.path !== '/register'
);

useTheme();
</script>

<template>
  <div id="app">
    <Navbar />
    <main class="page-wrapper">
      <router-view />
    </main>
    <Footer v-if="shouldShowFooter" />
    <NotificationPopup />
  </div>
</template>

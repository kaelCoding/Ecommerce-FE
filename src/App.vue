<script setup>
import Navbar from './components/layouts/Navbar.vue';
import Footer from './components/layouts/Footer.vue';
import NotificationPopup from './components/common/NotificationPopup.vue';
import ChatBubble from './components/chat/ChatBubble.vue';
import ChatWidget from './components/chat/ChatWidget.vue';
import { useTheme } from './composables/useTheme';
import { useRoute } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';
import { get_auth_user } from './stores/auth';

const route = useRoute();
const isChatOpen = ref(false);
const isMobile = ref(window.innerWidth <= 768);

onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
});

watch(isChatOpen, (isOpen) => {
  if (isMobile.value) {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
});

const shouldShowFooter = computed(() =>
  !route.path.startsWith('/admin') &&
  !route.path.startsWith('/chat') &&
  !route.path.startsWith('/profile') &&
  !route.path.startsWith('/lucky-spin') &&
  !route.path.startsWith('/products/detail') &&
  route.path !== '/login' &&
  route.path !== '/register'
);

const shouldShowChat = computed(() => {
  const user = get_auth_user.value;
  return user && !user.admin;
});

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

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

    <div v-if="shouldShowChat">
      <transition name="fade">
        <ChatWidget v-if="isChatOpen" @close="isChatOpen = false" />
      </transition>
      <ChatBubble @toggle-chat="toggleChat" />
    </div>
  </div>
</template>

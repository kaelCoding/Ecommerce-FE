<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header class="navbar" :class="{ 'scrolled': isScrolled }">
    <div class="container">
      <a href="/" class="logo">
        <img class="favicon-ctn" src="/public/images/image.png" alt="">
        <span>TUNI TOKU</span>
      </a>
      <nav class="nav-links">
        <RouterLink to="/">Trang chủ</RouterLink>
        <RouterLink to="/products">Sản phẩm</RouterLink>
        <a href="#about-us">Về chúng tôi</a>
        <a href="#contact">Liên hệ</a>
      </nav>
      <div class="nav-actions">
        <RouterLink to="/admin" class="action-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 18a4 4 0 0 0-8 0a4 4 0 0 0 8 0m-2-8a6 6 0 1 0-12 0a6 6 0 0 0 12 0M2 22s2-4 6-4s4 2 6 2s4-2 6-2" />
          </svg>
        </RouterLink>
      </div>
      <!-- <div class="nav-actions">
        <input type="text" class="search-bar" placeholder="Tìm kiếm sản phẩm...">
        <RouterLink to="/admin" class="action-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 18a4 4 0 0 0-8 0a4 4 0 0 0 8 0m-2-8a6 6 0 1 0-12 0a6 6 0 0 0 12 0M2 22s2-4 6-4s4 2 6 2s4-2 6-2" />
          </svg>
        </RouterLink>
        <a href="#" class="action-icon cart-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17 18a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2s2 .89 2 2M1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.75 1.03H8.1l-.9 1.63l-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-1L6 11.59l-1.35-2.45L3 4H1V2m6 16a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2s2 .89 2 2Z"/></svg>
          <span class="cart-badge">3</span>
        </a>
      </div> -->
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 15px 0;
  background-color: var(--white-color);
  z-index: 1000;
  transition: all var(--transition-speed) ease;
  border-bottom: 1px solid transparent;
  height: 72px;
}

.navbar.scrolled {
  box-shadow: var(--box-shadow);
  border-bottom: 1px solid var(--light-gray-color);
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary-color);
  text-decoration: none;
}

.favicon-ctn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  font-weight: 500;
  position: relative;
  transition: color var(--transition-speed) ease;
  color: var(--secondary-color);
  text-decoration: none;
}

.nav-links a:hover {
  color: var(--primary-color);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform var(--transition-speed) ease;
}

.nav-links a:hover::after {
  transform: scaleX(1);
}

/* .nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-bar {
  border: 1px solid #E5E7EB;
  border-radius: var(--border-radius);
  padding: 8px 15px;
  width: 250px;
  transition: all var(--transition-speed) ease;
}

.search-bar:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.action-icon {
  position: relative;
  color: var(--secondary-color);
  transition: color var(--transition-speed) ease;
  text-decoration: none;
}

.action-icon:hover {
  color: var(--primary-color);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background-color: var(--primary-color);
  color: var(--white-color);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
} */

@media (max-width: 800px) {
  .nav-links {
    gap: 20px;
  }
}

@media (max-width: 700px) {
  .nav-links {
    display: none;
  }
}
</style>
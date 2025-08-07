<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isSidebarOpen = ref(false);
const sidebar = ref(null);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleClickOutside = (event) => {
  if (isSidebarOpen.value && sidebar.value && !sidebar.value.contains(event.target)) {
    const menuToggleBtn = document.querySelector('.menu-toggle');
    if (menuToggleBtn && !menuToggleBtn.contains(event.target)) {
      isSidebarOpen.value = false;
    }
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="admin-wrapper">
    <div class="admin-mobile-header">
      <h2>KAEL Admin</h2>
      <button class="menu-toggle" @click="toggleSidebar">
        <i class="fas fa-bars"></i>
      </button>
    </div>

    <aside class="sidebar" :class="{ 'is-open': isSidebarOpen }">
      <div class="sidebar-header">
        <h2>Quản Trị</h2>
      </div>
      <nav class="sidebar-nav" ref="sidebar">
        <ul>
          <li>
            <router-link to="/admin">
              <i class="fas fa-tachometer-alt"></i>Dashboard
            </router-link>
          </li>
          <li>
            <router-link to="/admin/products">
              <i class="fas fa-box"></i> Sản Phẩm
            </router-link>
          </li>
          <li>
            <router-link to="/admin/categories">
              <i class="fas fa-list-alt"></i> Danh Mục
            </router-link>
          </li>
          <li>
            <RouterLink to="/">
              <i class="fas fa-sign-out-alt"></i> Đăng Xuất
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="main-content" :class="{ 'is-shifted': isSidebarOpen }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--light-gray-color);
}

.sidebar {
  width: 250px;
  background-color: var(--secondary-color);
  color: var(--white-color);
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.sidebar-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav ul li a {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: background-color var(--transition-speed) ease;
  color: var(--white-color);
  text-decoration: none;
}

.sidebar-nav ul li a:hover,
.sidebar-nav ul li a.router-link-exact-active { 
  background-color: var(--primary-color);
}

.sidebar-nav ul li a i {
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

.main-content {
  flex-grow: 1;
  padding: 40px;
  overflow-y: auto;
}

.admin-mobile-header {
  display: none;
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--white-color);
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .admin-wrapper {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(-100%);
    width: 250px;
    z-index: 1000;
  }

  .sidebar.is-open {
    transform: translateX(0);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  }

  .admin-mobile-header {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--secondary-color);
    color: var(--white-color);
    padding: 15px 20px;
    justify-content: space-between;
    align-items: center;
    z-index: 1001;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .admin-wrapper::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .sidebar.is-open~.main-content::before {
    opacity: 1;
    visibility: visible;
  }

  .main-content {
    padding: 20px;
  }
}
</style>
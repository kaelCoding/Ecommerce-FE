<script setup>
import { useRouter } from 'vue-router';
import { logout_user } from '@/stores/auth';

const router = useRouter();

const handleLogout = () => {
  logout_user();
  router.push('/login');
};
</script>

<template>
  <div class="admin-wrapper">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Quản Trị</h2>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li>
            <router-link to="/admin">
              <i class="fas fa-tachometer-alt"></i>Dashboard
            </router-link>
          </li>
          <li>
            <router-link to="/admin/orders">
              <i class="fas fa-receipt"></i> Đơn Hàng
            </router-link>
          </li>
          <li>
            <router-link to="/admin/rewards">
              <i class="fas fa-gift"></i> Phần Thưởng
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
            <router-link to="/admin/users">
              <i class="fas fa-user"></i> Người Dùng
            </router-link>
          </li>
          <li>
            <router-link to="/admin/chat">
              <i class="fa-solid fa-comments"></i> <span>Chat</span>
            </router-link>
          </li>
          <li @click="handleLogout" style="cursor: pointer;">
            <a> <i class="fas fa-sign-out-alt"></i> Đăng Xuất
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.admin-wrapper {
  display: flex;
  background-image: url('/public/images/background2.png');
  background-repeat: repeat;
  background-attachment: fixed;
  font-family: 'Inter', sans-serif;
  min-height: calc(100vh - 72px); 
}

.sidebar {
  width: clamp(200px, 20vw, 250px);
  background-color: var(--white-color);
  color: var(--text-color);
  box-shadow: var(--box-shadow);
  padding: clamp(15px, 2vw, 20px);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  align-self: flex-start;
  position: sticky;
  top: 72px; /* Dính vào dưới Navbar chính */
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.sidebar-header h2 {
  font-size: clamp(1.2rem, 2.5vw, 1.5rem);
  margin: 0;
  color: var(--secondary-color);
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav ul li a {
  display: flex;
  align-items: center;
  gap: clamp(10px, 2vw, 15px);
  padding: clamp(10px, 2.5vw, 15px) clamp(15px, 3vw, 20px);
  margin-bottom: clamp(5px, 1vw, 10px);
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease;
  color: var(--secondary-color);
  text-decoration: none;
  font-size: clamp(0.9rem, 2vw, 1rem);
  white-space: nowrap; /* Thêm để chữ không bị xuống dòng */
}

.sidebar-nav ul li a:hover,
.sidebar-nav ul li a.router-link-exact-active {
  background-color: var(--primary-color);
  color: var(--white-color);
}

.sidebar-nav ul li a i {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  width: 20px;
  text-align: center;
}

.main-content {
  flex-grow: 1;
  padding: clamp(20px, 4vw, 40px);
  overflow-y: auto;
}
@media (max-width: 768px) {
  .admin-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    top: 0;
    padding: 10px; 
    box-shadow: var(--box-shadow);
  }

  .sidebar-header {
    display: none;
  }

  .sidebar-nav ul {
    display: flex;
    flex-wrap: nowrap; /* Không cho xuống dòng */
    overflow-x: auto;  /* Cho phép cuộn ngang */
    -webkit-overflow-scrolling: touch;
  }

  .sidebar-nav ul li a {
    flex-shrink: 0; /* Ngăn các mục bị co lại */
    font-size: 0.9rem;
    padding: 10px 15px;
    margin-bottom: 0; /* Xóa margin dưới */
  }

  .main-content {
    padding: 20px;
  }
}
</style>
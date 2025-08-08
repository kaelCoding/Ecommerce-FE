<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { searchProductsAPI } from '@/services/product';
import SearchOverlay from '../product/SearchOverlay.vue';
import ThemeToggle from '../common/ThemeToggle.vue';

const searchQuery = ref('');
const searchResults = ref([]);
const isSearchActive = ref(false);
const isLoading = ref(false);
let debounceTimer = null;

watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer);
  if (newQuery.length > 1) {
    isLoading.value = true;
    debounceTimer = setTimeout(async () => {
      try {
        searchResults.value = await searchProductsAPI(newQuery);
      } catch (error) {
        console.error("Search failed:", error);
        searchResults.value = [];
      } finally {
        isLoading.value = false;
      }
    }, 300);
  } else {
    searchResults.value = [];
    isLoading.value = false;
  }
});

const openSearch = () => {
  isSearchActive.value = true;
};

const closeSearch = () => {
  isSearchActive.value = false;
  searchQuery.value = '';
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    closeSearch();
  }
};

const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <header class="navbar" :class="{ 'scrolled': isScrolled, 'search-active': isSearchActive }">
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
        <div class="search-container">
          <input type="text" class="search-bar" placeholder="Tìm kiếm sản phẩm..." v-model="searchQuery"
            @focus="openSearch">
          <i class="fa-solid fa-magnifying-glass search-icon" @click="openSearch"></i>
        </div>

        <button class="action-icon mobile-search-trigger" @click="openSearch">
          <i class="fa-brands fa-searchengin"></i>
        </button>

        <RouterLink to="/admin" class="action-icon">
          <i class="fa-solid fa-user-secret"></i>
        </RouterLink>

        <ThemeToggle />
        
      </div>
    </div>
  </header>
  <SearchOverlay :is-active="isSearchActive" :results="searchResults" :is-loading="isLoading" v-model="searchQuery"
    @close="closeSearch" />
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: clamp(10px, 2vh, 15px) 0; 
  background-color: var(--white-color);
  z-index: 100;
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
  padding: 0 20px; 
}

.logo {
  display: flex;
  align-items: center;
  gap: clamp(5px, 2vw, 10px); 
  font-size: clamp(1.2rem, 3vw, 1.5rem); 
  font-weight: 700;
  color: var(--secondary-color);
  text-decoration: none;
}

.favicon-ctn {
  width: clamp(32px, 5vw, 42px); 
  height: clamp(32px, 5vw, 42px);
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
  font-size: clamp(0.9rem, 2vw, 1rem); 
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

.nav-actions {
  display: flex;
  align-items: center;
  gap: clamp(10px, 3vw, 15px);
}

.action-icon {
  color: var(--secondary-color);
  transition: color var(--transition-speed) ease;
  text-decoration: none;
  border: none;
  cursor: pointer;
  background: none;
  font-size: clamp(1.1rem, 3vw, 1.5rem); 
}

.action-icon:hover {
  color: var(--primary-color);
}

.fa-user-secret {
  margin-top: 4px;
}

/* --- SEARCH BAR --- */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar {
  border: 1px solid #E5E7EB;
  border-radius: var(--border-radius);
  padding: clamp(6px, 2vw, 8px) clamp(10px, 3vw, 15px) clamp(6px, 2vw, 8px) clamp(30px, 6vw, 40px);
  width: clamp(180px, 25vw, 250px);
  transition: all var(--transition-speed) ease;
  background-color: #f3f4f6;
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.search-bar:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background-color: var(--white-color);
}

.search-icon {
  position: absolute;
  left: clamp(10px, 3vw, 15px);
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: var(--secondary-color);
  transition: all var(--transition-speed) ease;
  pointer-events: none;
}

.search-bar:focus+.search-icon {
  color: var(--primary-color);
}

.mobile-search-trigger {
  display: none;
}

@media (max-width: 960px) {
  .nav-links {
    display: none;
  }
}

@media (max-width: 768px) {
  .search-container {
    display: none;
  }

  .mobile-search-trigger {
    display: block;
  }

  .fa-user-secret, .mobile-search-trigger .fa-searchengin {
    font-size: clamp(1.2rem, 4vw, 1.5rem);
  }

  .fa-searchengin {
    margin-top: 2px;
  }
}
</style>
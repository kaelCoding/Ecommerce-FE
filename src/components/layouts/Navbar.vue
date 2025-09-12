<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { searchProductsAPI } from '@/services/product';
import { get_auth_user, logout_user } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/composables/useUtils';
import ThemeToggle from '../common/ThemeToggle.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const router = useRouter();
const { t, locale } = useI18n();

const searchQuery = ref('');
const searchResults = ref([]);
const isLoading = ref(false);
const isSearchActive = ref(false);
const isUserMenuOpen = ref(false);
let debounceTimer = null;
const isMobileMenuOpen = ref(false);

const handleSearch = async (query) => {
  if (query.length > 1) {
    isLoading.value = true;
    try {
      const results = await searchProductsAPI(query);
      searchResults.value = results.slice(0, 5);
    } catch (error) {
      console.error("Search failed:", error);
      searchResults.value = [];
    } finally {
      isLoading.value = false;
    }
  } else {
    searchResults.value = [];
    isLoading.value = false;
  }
};

watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    handleSearch(newQuery);
  }, 300);
});

const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

const openSearch = () => {
  isSearchActive.value = true;
  isMobileMenuOpen.value = false;
};

const closeSearch = () => {
  isSearchActive.value = false;
  searchQuery.value = '';
  searchResults.value = [];
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

const closeAllDropdowns = (event) => {
  if (isUserMenuOpen.value && !event.target.closest('.user-menu-container')) {
    isUserMenuOpen.value = false;
  }
  if (isSearchActive.value && !event.target.closest('.search-active-container')) {
    closeSearch();
  }
};

const goToSearchPage = () => {
  if (searchQuery.value.trim().length > 0) {
    router.push({ name: 'search-results', query: { q: searchQuery.value } });
    closeSearch();
  }
};

const handleLogout = () => {
  logout_user();
  isUserMenuOpen.value = false;
  router.push('/login');
};

const changeLocale = (newLocale) => {
  locale.value = newLocale;
  localStorage.setItem('locale', newLocale);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('click', closeAllDropdowns);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', closeAllDropdowns);
  document.body.style.overflow = '';
});
</script>

<template>
  <header class="navbar"
    :class="{ 'scrolled': isScrolled, 'search-active': isSearchActive, 'mobile-menu-active': isMobileMenuOpen }">
    <div class="container">
      <template v-if="!isSearchActive">
        <div class="mobile-menu-toggle">
          <i v-if="!isMobileMenuOpen" class="fa-solid fa-bars action-icon"  @click="toggleMobileMenu"></i>
          <button v-else class="close-mobile-menu" @click="toggleMobileMenu">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <RouterLink to="/" class="logo">
          <span>TUNI TOKU</span>
        </RouterLink>

        <nav class="nav-links desktop-only">
          <RouterLink to="/">{{ t('navbar.home') }}</RouterLink>
          <RouterLink to="/products">{{ t('navbar.products') }}</RouterLink>
          <a href="#about-us">{{ t('navbar.about') }}</a>
          <a href="#contact">{{ t('navbar.contact') }}</a>
        </nav>

        <div class="nav-actions">
          <div class="search-icon-wrapper">
            <i class="fa-solid fa-magnifying-glass action-icon" @click.stop="openSearch"></i>
          </div>
          <div class="user-menu-container">
            <i class="fa-solid fa-user action-icon" @click.stop="isUserMenuOpen = !isUserMenuOpen"></i>
            <div v-if="isUserMenuOpen" class="user-dropdown">
              <ThemeToggle @click="isUserMenuOpen = false" />
              <button v-if="locale === 'vi'" @click="changeLocale('en')" class="dropdown-item">
                English
              </button>
              <button v-else-if="locale === 'en'" @click="changeLocale('vi')" class="dropdown-item">
                Vietnamese
              </button>

              <RouterLink to="/profile" v-if="get_auth_user && !get_auth_user.admin" class="dropdown-item"
                @click="isUserMenuOpen = false" :title="t('navbar.profile')">
                {{ t('navbar.profile') }}
              </RouterLink>
              <RouterLink to="/admin" v-if="get_auth_user && get_auth_user.admin" class="dropdown-item"
                @click="isUserMenuOpen = false" :title="t('navbar.admin')">
                {{ t('navbar.admin') }}
              </RouterLink>
              <RouterLink v-if="!get_auth_user" to="/login" class="dropdown-item" @click="isUserMenuOpen = false">
                {{ t('navbar.login') }}
              </RouterLink>
              <span v-else class="dropdown-item" @click="handleLogout">
                {{ t('navbar.logout') }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <div v-if="isSearchActive" class="search-active-container" @click.stop>
        <div class="search-input-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" class="search-bar expanded" :placeholder="t('navbar.searchPlaceholder')"
            v-model="searchQuery" @keydown.enter="goToSearchPage" autofocus>
          <button class="close-btn" @click="closeSearch">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div v-if="searchQuery.length > 1" class="search-results-expanded">
          <LoadingSpinner v-if="isLoading" :message="t('navbar.loading')" />
          <div v-else-if="searchResults.length > 0">
            <div class="results-list">
              <RouterLink v-for="product in searchResults" :key="product.ID" :to="`/products/detail/${product.ID}`"
                class="result-item" @click="closeSearch">
                <img :src="product.image_urls[0]" :alt="product.name" class="result-item-image" />
                <div class="result-item-info">
                  <h4 class="result-item-name">{{ product.name }}</h4>
                  <p class="result-item-price">{{ formatPrice(product.price) }}</p>
                </div>
              </RouterLink>
            </div>
            <div class="view-all-results" @click="goToSearchPage">
              {{ t('navbar.viewallResult') }} "{{ searchQuery }}"
            </div>
          </div>
          <div v-else class="empty-state">
            <p>{{ t('navbar.emptyState') }} "<strong>{{ searchQuery }}</strong>".</p>
          </div>
        </div>
      </div>
    </div>

    <transition name="slide-fade">
      <div v-if="isMobileMenuOpen" class="mobile-menu-panel">
        <nav class="mobile-nav-links">
          <RouterLink to="/" @click="toggleMobileMenu">{{ t('navbar.home') }}</RouterLink>
          <RouterLink to="/products" @click="toggleMobileMenu">{{ t('navbar.products') }}</RouterLink>
          <a href="#about-us" @click="toggleMobileMenu">{{ t('navbar.about') }}</a>
          <a href="#contact" @click="toggleMobileMenu">{{ t('navbar.contact') }}</a>
        </nav>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.search-icon-wrapper {
  display: flex;
  align-items: center;
}

.view-all-results {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  color: var(--primary-color);
  border-top: 1px solid var(--light-gray-color);
  transition: background-color var(--transition-speed) ease;
  font-size: 0.9rem;
}

.view-all-results:hover {
  background-color: var(--white-color);
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: clamp(10px, 2vh, 15px) 0;
  background-color: var(--body-color);
  z-index: 100;
  transition: all var(--transition-speed) ease;
  height: 72px;
  border-color: #374151;
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
  height: 100%;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: clamp(6px, 2vw, 12px);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary-color);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  font-weight: 500;
  position: relative;
  transition: color var(--transition-speed) ease;
  color: var(--secondary-color);
  text-decoration: none;
  font-size: 1rem;
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
  font-size: 1.25rem;
}

.action-icon:hover {
  color: var(--primary-color);
}

.user-menu-container {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: var(--white-color);
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  min-width: 150px;
  z-index: 1000;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 3vw, 12px);
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  text-align: left;
  color: var(--secondary-color);
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-speed) ease;
  font-size: 0.9rem;
  border-top: 1px solid var(--light-gray-color);
}

.dropdown-item:hover {
  background-color: var(--primary-color);
}

.navbar:not(.search-active) .search-container {
  position: relative;
}

.navbar .logo,
.navbar .nav-links,
.navbar .nav-actions {
  transition: opacity var(--transition-speed) ease;
}

.navbar.search-active .logo,
.navbar.search-active .nav-links,
.navbar.search-active .nav-actions {
  display: none;
}

.search-active-container {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.search-bar.expanded {
  width: 100%;
  padding: 10px 40px;
  border: 1px solid #E5E7EB;
  border-radius: var(--border-radius);
  background-color: var(--white-color);
  font-size: 1rem;
}

.search-bar.expanded:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.search-icon {
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  position: absolute;
  color: var(--secondary-color);
  font-size: 1rem;
}

.close-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--secondary-color);
}

.search-results-expanded {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: var(--white-color);
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  z-index: 99;
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--secondary-color);
}

.results-list {
  display: flex;
  flex-direction: column;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  transition: background-color 0.2s ease;
  text-decoration: none;
}

.result-item:hover {
  background-color: var(--light-gray-color);
}

.result-item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.result-item-info {
  flex-grow: 1;
}

.result-item-name {
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 2px;
  font-size: 0.95rem;
}

.result-item-price {
  font-size: 0.85rem;
  color: var(--primary-color);
}

.mobile-menu-toggle {
  display: none;
}

.mobile-menu-panel {
  position: fixed;
  top: 72;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--body-color);
  z-index: 20;
  padding: 20px;
}

.close-mobile-menu {
  background: none;
  border: none;
  color: var(--secondary-color);
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  cursor: pointer;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mobile-nav-links a {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--secondary-color);
  text-decoration: none;
  border-bottom: 1px solid var(--light-gray-color);
  transition: color var(--transition-speed) ease;
}

.mobile-nav-links a:hover {
  color: var(--primary-color);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}


@media (max-width: 960px) {
  .nav-links.desktop-only {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
    z-index: 2;
  }

  .container {
    display: grid;
    align-items: center;
  }

  .logo {
    grid-column: 2 / 3;
    justify-self: center;
  }

  .mobile-menu-toggle {
    grid-column: 1 / 2;
    justify-self: start;
  }

  .nav-actions {
    grid-column: 3 / 4;
    justify-self: end;
  }
}
</style>
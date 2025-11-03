<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { searchProductsAPI } from '@/services/product';
import { get_auth_user, logout_user } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/composables/useUtils';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { useCartStore } from '@/stores/cart'; 
import { storeToRefs } from 'pinia';

const router = useRouter();
const { t, locale } = useI18n();

const cartStore = useCartStore();
const { cartTotalItems } = storeToRefs(cartStore);

const searchQuery = ref('');
const searchResults = ref([]);
const isLoading = ref(false);
const isSearchActive = ref(false);
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
let debounceTimer = null;

watch(isMobileMenuOpen, (newVal) => {
  document.body.style.overflow = newVal ? 'hidden' : '';
});

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
  const banner = document.querySelector('.header-banner');
  if (banner) {
    isScrolled.value = window.scrollY > banner.offsetHeight;
  } else {
    isScrolled.value = window.scrollY > 10;
  }
};

const openSearch = () => {
  isSearchActive.value = true;
};

const closeSearch = () => {
  isSearchActive.value = false;
  searchQuery.value = '';
  searchResults.value = [];
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeAllDropdowns = (event) => {
  if (isUserMenuOpen.value && !event.target.closest('.user-menu-container')) {
    isUserMenuOpen.value = false;
  }
  if (isSearchActive.value && !event.target.closest('.search-active-container')) {
    closeSearch();
  }
  if (isMobileMenuOpen.value && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-toggle')) {
    isMobileMenuOpen.value = false;
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
  isMobileMenuOpen.value = false;
  router.push('/login');
};

const changeLocale = (newLocale) => {
  locale.value = newLocale;
  localStorage.setItem('locale', newLocale);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('click', closeAllDropdowns);

  if (get_auth_user.value) {
    cartStore.fetchCart();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', closeAllDropdowns);
  document.body.style.overflow = '';
});
</script>

<template>
  <header class="navbar">
    <div class="header-banner">
      <RouterLink to="/">
        <img src="/public/images/tuni4.png" alt="Tuni Toku Banner" />
      </RouterLink>
    </div>

    <div class="nav-bar-wrapper" :class="{ 'scrolled': isScrolled, 'search-active': isSearchActive }">
      <div class="container">
        <template v-if="!isSearchActive">
          <button class="mobile-menu-toggle" @click.stop="toggleMobileMenu">
            <i class="fa-solid fa-bars"></i>
          </button>

          <nav class="nav-links hide-on-mobile">
            <RouterLink to="/">{{ t('navbar.home') }}</RouterLink>
            <RouterLink to="/products">{{ t('navbar.products') }}</RouterLink>
            <RouterLink to="/proxy-order">MERCARI</RouterLink>
            <a href="#contact" class="hide-on-small">LIÊN HỆ</a>
            <a href="#about-us" class="hide-on-small">VỀ CHÚNG TÔI</a>
          </nav>

          <div class="nav-actions hide-on-mobile">
            <div class="search-icon-wrapper">
              <i class="fa-solid fa-magnifying-glass action-icon" @click.stop="openSearch"></i>
            </div>
            <div class="user-menu-container">
              <i class="fa-solid fa-user action-icon" @click.stop="isUserMenuOpen = !isUserMenuOpen"></i>
              <div v-if="isUserMenuOpen" class="user-dropdown">
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
            <RouterLink to="/cart" class="cart-icon-wrapper">
              <i class="fas fa-shopping-cart action-icon"></i>
              <span v-if="cartTotalItems > 0" class="cart-item-count">{{ cartTotalItems }}</span>
            </RouterLink>
          </div>

          <div class="nav-actions-mobile">
            <div class="search-icon-wrapper">
              <i class="fa-solid fa-magnifying-glass action-icon" @click.stop="openSearch"></i>
            </div>
            <RouterLink to="/cart" class="cart-icon-wrapper">
              <i class="fas fa-shopping-cart action-icon"></i>
              <span v-if="cartTotalItems > 0" class="cart-item-count">{{ cartTotalItems }}</span>
            </RouterLink>
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
    </div>

    <teleport to="body">
      <transition name="slide-fade">
        <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="toggleMobileMenu"></div>
      </transition>
      <transition name="slide-left">
        <nav v-if="isMobileMenuOpen" class="mobile-menu">
          <div class="mobile-menu-header">
            <h3>Menu</h3>
            <button class="close-btn" @click="toggleMobileMenu">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="mobile-menu-links">
            <div v-if="get_auth_user">
              <RouterLink to="/profile" v-if="!get_auth_user.admin" class="mobile-link" @click="toggleMobileMenu">
                <i class="fa-solid fa-user"></i> {{ t('navbar.profile') }}
              </RouterLink>
              <RouterLink to="/admin" v-if="get_auth_user.admin" class="mobile-link" @click="toggleMobileMenu">
                <i class="fa-solid fa-user-shield"></i> {{ t('navbar.admin') }}
              </RouterLink>
            </div>
            <div v-else>
              <RouterLink to="/login" class="mobile-link" @click="toggleMobileMenu">
                <i class="fa-solid fa-right-to-bracket"></i> {{ t('navbar.login') }}
              </RouterLink>
            </div>

            <hr class="mobile-divider" />

            <RouterLink to="/" class="mobile-link" @click="toggleMobileMenu">
              <i class="fa-solid fa-house"></i> {{ t('navbar.home') }}
            </RouterLink>
            <RouterLink to="/products" class="mobile-link" @click="toggleMobileMenu">
              <i class="fa-solid fa-boxes-stacked"></i> {{ t('navbar.products') }}
            </RouterLink>
            <RouterLink to="/proxy-order" class="mobile-link" @click="toggleMobileMenu">
              <i class="fa-solid fa-boxes-packing"></i> MERCARI
            </RouterLink>
            <a href="#contact" class="mobile-link" @click="toggleMobileMenu">
              <i class="fa-solid fa-phone"></i> LIÊN HỆ
            </a>
            <a href="#about-us" class="mobile-link" @click="toggleMobileMenu">
              <i class="fa-solid fa-circle-info"></i> VỀ CHÚNG TÔI
            </a>
            
            <hr class="mobile-divider" />

            <span v-if="get_auth_user" class="mobile-link logout" @click="handleLogout">
              <i class="fa-solid fa-right-from-bracket"></i> {{ t('navbar.logout') }}
            </span>
          </div>
        </nav>
      </transition>
    </teleport>
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

.header-banner {
  width: 100%;
  padding: 0; 
  margin: 0; 
  background-color: var(--white-color);
}

.header-banner > a {
  display: block;
  width: 100%;
  height: 100%;
}

.header-banner img {
  width: 100%;
  height: 100%; 
  object-fit: cover;
  object-position: top; 
}

.nav-bar-wrapper {
  width: 100%;
  background-color: var(--white-color);
  height: 72px;
  transition: all var(--transition-speed) ease;
}

.navbar {
  width: 100%;
  z-index: 100;
  transition: all var(--transition-speed) ease;
}

.container {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  align-items: center;
  height: 100%;
}


.nav-links {
  display: flex;
  gap: clamp(0.8rem, 1.5vw, 1.5rem);
  height: 100%;
  align-items: center;
}

.nav-links a {
  font-weight: 600;
  position: relative;
  transition: color var(--transition-speed) ease;
  color: var(--secondary-color);
  text-decoration: none;
  font-size: clamp(0.9rem, 1.2vw, 1rem);
  white-space: nowrap;
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
  gap: clamp(15px, 3vw, 20px);
  justify-content: flex-end;
  height: 100%;
}

.cart-icon-wrapper {
  position: relative;
  text-decoration: none;
  line-height: 1;
}

.cart-item-count {
  position: absolute;
  top: -10px;
  right: -12px;
  background-color: var(--primary-color);
  color: var(--white-color);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid var(--white-color);
}

.action-icon {
  color: var(--secondary-color);
  transition: color var(--transition-speed) ease;
  text-decoration: none;
  border: none;
  cursor: pointer;
  background: none;
  font-size: clamp(1.1rem, 2vw, 1.25rem);
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

.nav-bar-wrapper:not(.search-active) .search-container {
  position: relative;
}

.nav-bar-wrapper .nav-links,
.nav-bar-wrapper .nav-actions,
.nav-bar-wrapper .mobile-menu-toggle {
  transition: opacity var(--transition-speed) ease;
}

.nav-bar-wrapper.search-active .nav-links,
.nav-bar-wrapper.search-active .nav-actions,
.nav-bar-wrapper.search-active .mobile-menu-toggle {
  display: none;
}

.search-active-container {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  grid-column: 1 / 4; 
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
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.3);
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


.mobile-menu-toggle { display: none; }
.nav-actions-mobile { display: none; }

@media (max-width: 900px) {
  .nav-links a.hide-on-small {
    display: none;
  }
  .hide-on-mobile {
    display: none !important;
  }
  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    margin-left: -10px;
  }
  .mobile-menu-toggle .fa-solid {
    font-size: 1.5rem;
    color: var(--secondary-color);
  }
  .nav-actions-mobile {
    display: flex;
    align-items: center;
    gap: clamp(15px, 3vw, 20px);
  }
}

.nav-bar-wrapper.scrolled {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  box-shadow: var(--box-shadow); 
  animation: slideDown 0.3s ease-out;
  z-index: 2;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  max-width: 80vw;
  height: 100vh;
  background-color: var(--white-color);
  z-index: 1002;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1); 
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--light-gray-color);
}
.mobile-menu-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--secondary-color);
}


.mobile-menu-links {
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--secondary-color);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-speed) ease;
}
.mobile-link .fa-solid {
  width: 20px;
  text-align: center;
  color: var(--text-color);
  opacity: 0.8;
}
.mobile-link:hover {
  background-color: var(--light-gray-color);
}

.mobile-cart-count {
  background-color: var(--primary-color);
  color: var(--white-color);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  margin-left: auto;
}

.mobile-divider {
  border: none;
  border-top: 1px solid var(--light-gray-color);
  margin: 0.5rem 0;
}

.mobile-link.logout {
  color: #dc2626;
  cursor: pointer;
}
.mobile-link.logout .fa-solid {
  color: #dc2626;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
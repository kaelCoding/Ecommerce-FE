import { defineStore } from 'pinia';
import { get_categories_api, get_products_by_category_api, get_productslimit_by_category_api } from '@/services/category';

const REFRESH_INTERVAL = 720 * 60 * 1000; 

export const useProductStore = defineStore('product', {
  state: () => ({
    categoriesWithProducts: [],
    isLoading: false,
    error: null,
    allProductsLoaded: false,
  }),

  actions: {
    startLimitedProductsTimer() {
      this.stopLimitedProductsTimer(); 
      this.limitedProductsTimer = setInterval(() => {
        this.fetchLimitedProductsForCategories();
      }, REFRESH_INTERVAL);
    },

    stopLimitedProductsTimer() {
      if (this.limitedProductsTimer) {
        clearInterval(this.limitedProductsTimer);
        this.limitedProductsTimer = null;
      }
    },

    startAllProductsTimer() {
      this.stopAllProductsTimer();
      this.allProductsTimer = setInterval(() => {
        this.fetchCategoriesAndProducts();
      }, REFRESH_INTERVAL);
    },

    stopAllProductsTimer() {
      if (this.allProductsTimer) {
        clearInterval(this.allProductsTimer);
        this.allProductsTimer = null;
      }
    },

    async fetchLimitedProductsForCategories() {
      if (this.categoriesWithProducts.length > 0 && !this.isLoading && !this.limitedProductsTimer) {
        this.startLimitedProductsTimer();
        return;
      }

      this.isLoading = true;
      this.error = null;
      try {
        const categories = await get_categories_api();
        if (!categories || categories.length === 0) {
          this.categoriesWithProducts = [];
          return;
        }

        const productPromises = categories.map(category =>
          get_productslimit_by_category_api(category.ID).then(products => ({
            ...category,
            products: products,
          }))
        );

        const results = await Promise.all(productPromises);
        this.categoriesWithProducts = results.filter(cat => cat.products && cat.products.length > 0);
        this.startLimitedProductsTimer();
      } catch (err) {
        this.error = err;
        console.error("Failed to fetch limited data:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCategoriesAndProducts() {
      if (this.allProductsLoaded && !this.allProductsTimer) {
        this.startAllProductsTimer();
        return;
      }

      this.isLoading = true;
      this.error = null;
      try {
        const categories = await get_categories_api();
        if (!categories || categories.length === 0) {
          this.categoriesWithProducts = [];
          this.allProductsLoaded = true;
          return;
        }

        const productPromises = categories.map(category =>
          get_products_by_category_api(category.ID).then(products => ({
            ...category,
            products: products,
          }))
        );

        const results = await Promise.all(productPromises);
        this.categoriesWithProducts = results.filter(cat => cat.products && cat.products.length > 0);
        this.allProductsLoaded = true;
        this.startAllProductsTimer();
      } catch (err) {
        this.error = err;
        console.error("Failed to fetch data:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    resetProductState() {
      this.stopLimitedProductsTimer();
      this.stopAllProductsTimer();
      this.categoriesWithProducts = [];
      this.allProductsLoaded = false;
      this.isLoading = false;
      this.error = null;
    }
  },
});
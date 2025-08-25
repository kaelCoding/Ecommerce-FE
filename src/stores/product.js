import { defineStore } from 'pinia';
import { get_categories_api, get_products_by_category_api, get_productslimit_by_category_api } from '@/services/category';

export const useProductStore = defineStore('product', {
  state: () => ({
    _categories: [], 
    productsByCategory: {},
    categoryProductLoadState: {},
    isLoading: false,
    error: null,
  }),

  getters: {
    homePageProducts: (state) => {
      if (state._categories.length === 0) return [];
      return state._categories.map(category => ({
        ...category,
        products: (state.productsByCategory[category.ID] || []).slice(0, 8),
      })).filter(cat => cat.products.length > 0);
    },

    listPageProducts: (state) => {
      if (state._categories.length === 0) return [];
      return state._categories.map(category => ({
        ...category,
        products: state.productsByCategory[category.ID] || [],
      })).filter(cat => cat.products.length > 0);
    },

    getRelatedProducts: (state) => (categoryId, currentProductId, limit = 6) => {
      const products = state.productsByCategory[categoryId] || [];
      return products
        .filter(p => p.ID !== currentProductId) 
        .slice(0, limit);
    }
  },

  actions: {
    async _fetchCategoriesOnce() {
      if (this._categories.length > 0) return;
      try {
        this._categories = await get_categories_api();
        this._categories.forEach(cat => {
          if (!this.categoryProductLoadState[cat.ID]) {
            this.categoryProductLoadState[cat.ID] = 'none';
          }
        });
      } catch (err) {
        this.error = err;
        console.error("Failed to fetch categories:", err);
      }
    },

    async fetchProductsForHome() {
      this.isLoading = true;
      await this._fetchCategoriesOnce();

      const promises = this._categories.map(async (category) => {
        const state = this.categoryProductLoadState[category.ID];
        if (state === 'limited' || state === 'full') {
          return;
        }
        const products = await get_productslimit_by_category_api(category.ID, 8);
        this.productsByCategory[category.ID] = products || [];
        this.categoryProductLoadState[category.ID] = 'limited';
      });

      await Promise.all(promises);
      this.isLoading = false;
    },

    async fetchProductsForList() {
      this.isLoading = true;
      await this._fetchCategoriesOnce();

      const promises = this._categories.map(async (category) => {
        const state = this.categoryProductLoadState[category.ID];
        if (state === 'full') {
          return;
        }
        const products = await get_products_by_category_api(category.ID);
        this.productsByCategory[category.ID] = products || [];
        this.categoryProductLoadState[category.ID] = 'full';
      });
      
      await Promise.all(promises);
      this.isLoading = false;
    },

    async ensureCategoryProducts(categoryId) {
        if (this.categoryProductLoadState[categoryId] === 'full') {
            return;
        }
        try {
            const products = await get_products_by_category_api(categoryId);
            this.productsByCategory[categoryId] = products || [];
            this.categoryProductLoadState[categoryId] = 'full';
        } catch (err) {
            console.error(`Failed to fetch products for category ${categoryId}:`, err);
        }
    }
  },
});
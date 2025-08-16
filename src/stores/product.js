import { defineStore } from 'pinia';
import { get_categories_api, get_products_by_category_api } from '@/services/category';

export const useProductStore = defineStore('product', {
  state: () => ({
    categoriesWithProducts: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchCategoriesAndProducts() {
      if (this.categoriesWithProducts.length > 0 && !this.isLoading) {
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
          get_products_by_category_api(category.ID).then(products => ({
            ...category,
            products: products,
          }))
        );

        const results = await Promise.all(productPromises);
        this.categoriesWithProducts = results.filter(cat => cat.products && cat.products.length > 0);
      } catch (err) {
        this.error = err;
        console.error("Failed to fetch data:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
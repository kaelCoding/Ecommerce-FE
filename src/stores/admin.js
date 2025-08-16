import { defineStore } from "pinia";
import { get_products_api, delete_product_api, get_productID_api } from "@/services/product";
import { get_categories_api, delete_category_api } from "@/services/category";
import { get_users_api } from "@/services/auth";

async function _fetchResource(
  apiCall,
  dataProperty,
  loadingProperty,
  options = {}
) {
  if (this[dataProperty].length > 0 && !options.force) {
    return;
  }

  this.isLoading[loadingProperty] = true;
  this.error = null;
  try {
    const response = await apiCall();
    this[dataProperty] = response;
  } catch (err) {
    this.error = err;
    console.error(`Failed to fetch ${dataProperty}:`, err);
    throw err;
  } finally {
    this.isLoading[loadingProperty] = false;
  }
}

export const useAdminStore = defineStore("admin", {
  state: () => ({
    products: [],
    categories: [],
    users: [],
    isLoading: {
      products: false,
      categories: false,
      users: false,
      all: false,
    },
    error: null,
  }),

  actions: {
    async fetchProducts(force = false) {
      await _fetchResource.call(
        this,
        get_products_api,
        "products",
        "products",
        { force }
      );
    },

    async fetchCategories(force = false) {
      await _fetchResource.call(
        this,
        get_categories_api,
        "categories",
        "categories",
        { force }
      );
    },

    async fetchUsers(force = false) {
      await _fetchResource.call(this, get_users_api, "users", "users", {
        force,
      });
    },

    async fetchAllDashboardData() {
      if (
        this.products.length > 0 &&
        this.categories.length > 0 &&
        this.users.length > 0
      ) {
        return;
      }
      this.isLoading.all = true;
      try {
        await Promise.all([
          this.fetchProducts(),
          this.fetchCategories(),
          this.fetchUsers(),
        ]);
      } catch (err) {
        this.error = "Failed to load dashboard data.";
      } finally {
        this.isLoading.all = false;
      }
    },

    async fetchProductById(id) {
      const existingProduct = this.products.find((p) => p.ID === id);
      if (existingProduct) {
        return existingProduct;
      }
      try {
        const product = await get_productID_api(id);
        return product;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    async deleteProduct(productId) {
      try {
        await delete_product_api(productId);
        this.products = this.products.filter(
          (product) => product.ID !== productId
        );
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    addProduct(newProduct) {
      this.products.unshift(newProduct);
    },

    updateProduct(updatedProduct) {
      const index = this.products.findIndex((p) => p.ID === updatedProduct.ID);
      if (index !== -1) {
        this.products[index] = updatedProduct;
      }
    },

    async fetchCategoryById(id) {
      const existingCategory = this.categories.find((c) => c.ID === id);
      if (existingCategory) {
        return existingCategory;
      }

      try {
        const category = await get_categoryID_api(id);
        this.categories.push(category);
        return category;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    async deleteCategory(categoryId) {
      try {
        await delete_category_api(categoryId);
        this.categories = this.categories.filter(
          (category) => category.ID !== categoryId
        );
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    addCategory(newCategory) {
      this.categories.push(newCategory);
    },

    updateCategory(updatedCategory) {
      const index = this.categories.findIndex(
        (c) => c.ID === updatedCategory.ID
      );
      if (index !== -1) {
        this.categories[index] = updatedCategory;
      }
    },
  },
});

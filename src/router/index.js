import { createRouter, createWebHistory } from "vue-router";
import middleware from "./middleware";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    // {
    //   path: "/register",
    //   component: () => import("../views/RegisterView.vue"),
    // },
    {
      path: "/login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/products",
      name: "product-list",
      component: () => import("../components/product/ProductListView.vue"),
    },
    {
      path: "/products/detail/:id",
      name: "product-detail",
      component: () => import("../components/product/DetailProduct.vue"),
    },
    {
      path: "/admin",
      component: () => import("../components/layouts/AdminLayout.vue"),
      children: [
        {
          path: "",
          name: "admin-dashboard",
          component: () => import("../admin/DashboardView.vue"),
        },
        {
          path: "products",
          name: "admin-products",
          component: () => import("../admin/ProductListView.vue"),
        },
        {
          path: "products/new",
          name: "admin-products-new",
          component: () => import("../admin/ProductFormView.vue"),
        },
        {
          path: "products/edit/:id",
          name: "admin-products-edit",
          component: () => import("../admin/ProductFormView.vue"),
        },
        {
          path: "categories",
          name: "admin-categories",
          component: () => import("../admin/CategoryListView.vue"),
        },
        {
          path: "categories/new",
          name: "admin-categories-new",
          component: () => import("../admin/CategoryFormView.vue"),
        },
        {
          path: "categories/edit/:id",
          name: "admin-categories-edit",
          component: () => import("../admin/CategoryFormView.vue"),
        },
        // {
        //   path: "users",
        //   name: "admin-users",
        //   component: () => import("../admin/UserListView.vue"),
        // },
      ],
    },
  ],
});

new middleware(router);

export default router;

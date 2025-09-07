import { createRouter, createWebHashHistory } from "vue-router";
import middleware from "./middleware";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/register",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../components/layouts/UserProfile.vue"),
    },
    {
      path: "/chat",
      name: "chat",
      component: () => import("../views/ChatView.vue"),
    },
    {
      path: "/products",
      name: "product-list",
      component: () => import("../components/product/ListProduct.vue"),
    },
    {
      path: "/products/detail/:id",
      name: "product-detail",
      component: () => import("../components/product/DetailProduct.vue"),
    },
    {
      path: "/lucky-spin",
      name: "lucky-spin",
      component: () => import("../views/LuckySpinView.vue"),
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
        {
          path: "users",
          name: "admin-users",
          component: () => import("../admin/UserListView.vue"),
        },
        {
          path: "chat",
          name: "admin-chat",
          component: () => import("../admin/ChatAdminView.vue"),
        },
        {
          path: "orders",
          name: "admin-orders",
          component: () => import("../admin/OrderListView.vue"),
        },
        {
          path: "rewards",
          name: "admin-rewards",
          component: () => import("../admin/RewardListView.vue"),
        },
        {
          path: "rewards/new",
          name: "admin-rewards-new",
          component: () => import("../admin/RewardFormView.vue"),
        },
        {
          path: "rewards/edit/:id",
          name: "admin-rewards-edit",
          component: () => import("../admin/RewardFormView.vue"),
        },
      ],
    },
  ],
});

new middleware(router);

export default router;

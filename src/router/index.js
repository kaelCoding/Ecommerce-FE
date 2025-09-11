import { createRouter, createWebHistory } from "vue-router";
import { updateMetaTag, updateCanonicalLink } from '@/utils/meta';
import middleware from "./middleware";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: {
        title: 'Tuni Toku - Cửa hàng mô hình, đồ chơi Tokusatsu chính hãng',
        description: 'Chuyên cung cấp mô hình, DX Driver, Henshin Belt từ Kamen Rider, Super Sentai. Hàng chính hãng Bandai, giá tốt, uy tín.'
      },
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
      meta: {
        title: 'Tất cả sản phẩm | Mô hình Kamen Rider & Super Sentai | Tuni Toku',
        description: 'Khám phá bộ sưu tập đồ chơi và mô hình Tokusatsu đa dạng tại Tuni Toku. Tìm kiếm DX Driver, Vistamp, Gaia Memory và nhiều hơn nữa.'
      },
    },
    {
      path: "/products/detail/:id",
      name: "product-detail",
      component: () => import("../components/product/DetailProduct.vue"),
      meta: {
        title: 'Chi tiết sản phẩm',
        description: 'Xem chi tiết thông tin, hình ảnh và giá của sản phẩm Tokusatsu tại Tuni Toku.'
      }
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

router.afterEach((to, from) => {
  const siteName = 'Tuni Toku';
  const defaultImageUrl = `${window.location.origin}/images/img2.jpg`;

  document.title = to.meta.title || siteName;
  updateMetaTag('description', to.meta.description, false);

  updateMetaTag('og:title', document.title);
  updateMetaTag('og:description', to.meta.description);
  updateMetaTag('og:url', window.location.href);
  updateMetaTag('og:image', to.meta.ogImage || defaultImageUrl);
  updateMetaTag('og:site_name', siteName);

  updateMetaTag('twitter:title', document.title, false);
  updateMetaTag('twitter:description', to.meta.description, false);
  updateMetaTag('twitter:image', to.meta.ogImage || defaultImageUrl, false);

  updateCanonicalLink();
});

new middleware(router);

export default router;

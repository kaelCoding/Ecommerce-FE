import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemap from 'vite-plugin-sitemap'
import fetchAllProductIds from './vite-scripts/fetch-product-ids.js';

export default defineConfig(async () => {
  const productIds = await fetchAllProductIds();
  const dynamicRoutes = productIds.map(id => `/products/detail/${id}`);

  return {
    plugins: [
      vue(),
      vueDevTools(),
      sitemap({
        hostname: '[https://tunitoku.store](https://tunitoku.store)',
        dynamicRoutes: dynamicRoutes,
        exclude: ['/admin', '/profile', '/chat'],
      }),
    ],
    base: '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})

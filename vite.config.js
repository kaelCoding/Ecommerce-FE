import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemap from 'vite-plugin-sitemap'
import fetchSitemapRoutes from './vite-scripts/fetch-sitemap-routes.js';

export default defineConfig(async () => {
  const dynamicRoutesFromApi = await fetchSitemapRoutes();

  const staticRoutes = [
    '/',
    '/products',
  ];

  const allDynamicRoutes = [...staticRoutes, ...dynamicRoutesFromApi];

  return {
    plugins: [
      vue(),
      vueDevTools(),
      sitemap({
        hostname: 'https://tunitoku.store',
        dynamicRoutes: allDynamicRoutes,
        robots: [{ userAgent: '*', allow: '/' }],
        exclude: ['/admin/**', '/profile', '/chat', '/register', '/login', '/search'],
        readable: true,
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
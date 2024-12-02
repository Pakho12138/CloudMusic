import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/home/index.vue';

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/search/index.vue'),
    },
    {
      path: '/mv',
      name: 'mv',
      component: () => import('../views/mv/index.vue'),
    },
    {
      path: '/video',
      name: 'video',
      component: () => import('../views/video/index.vue'),
    },
  ],
});

export default router;

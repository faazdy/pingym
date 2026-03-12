import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/login", component: () => import("../pages/Login.vue"), meta: { guest: true } },
  { path: "/register", component: () => import("../pages/Register.vue"), meta: { guest: true } },
  {
    path: "/dashboard",
    component: () => import("../pages/dashboard/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/clients",
    component: () => import("../pages/dashboard/ClientPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/memberships",
    component: () => import("../pages/dashboard/MembershipsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/routines",
    component: () => import("../pages/dashboard/RoutinesView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return "/login";
  if (to.meta.guest && auth.isAuthenticated) return "/dashboard";
});

export default router;
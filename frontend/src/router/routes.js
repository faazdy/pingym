import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/login", component: () => import("../pages/Login.vue"), meta: { guest: true } },
  { path: "/register", component: () => import("../pages/Register.vue"), meta: { guest: true } },
  {
    path: "/superadmin",
    component: () => import("../pages/SuperAdminView.vue"),
    meta: { requiresAuth: true, superadminOnly: true },
  },
  {
    path: "/dashboard",
    component: () => import("../pages/dashboard/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/clients",
    component: () => import("../pages/dashboard/ClientPage.vue"),
    meta: { requiresAuth: true, requiresGym: true, roles: ["admin", "trainer"] },
  },
  {
    path: "/trainers",
    component: () => import("../pages/dashboard/TrainersView.vue"),
    meta: { requiresAuth: true, requiresGym: true, roles: ["admin", "trainer"] },
  },
  {
    path: "/memberships",
    component: () => import("../pages/dashboard/MembershipsView.vue"),
    meta: { requiresAuth: true, requiresGym: true, roles: ["admin"] },
  },
  {
    path: "/routines",
    component: () => import("../pages/dashboard/RoutinesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/attendance",
    component: () => import("../pages/dashboard/AttendanceView.vue"),
    meta: { requiresAuth: true, requiresGym: true },
  },
  {
    path: "/lockers",
    component: () => import("../pages/dashboard/LockersView.vue"),
    meta: { requiresAuth: true, requiresGym: true },
  },
  {
    path: "/progress",
    component: () => import("../pages/dashboard/ProgressView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/posts",
    component: () => import("../pages/dashboard/PostsView.vue"),
    meta: { requiresAuth: true, requiresGym: true },
  },
  {
    path: "/qr",
    component: () => import("../pages/dashboard/QrView.vue"),
    meta: { requiresAuth: true, requiresGym: true, roles: ["admin"] },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return "/login";
  if (to.meta.guest && auth.isAuthenticated) {
    return auth.user?.role === "superadmin" ? "/superadmin" : "/dashboard";
  }
  if (to.meta.superadminOnly && auth.user?.role !== "superadmin") return "/dashboard";
  if (to.meta.requiresAuth && to.path === "/dashboard" && auth.user?.role === "superadmin") {
    return "/superadmin";
  }
  if (to.meta.requiresGym && !auth.hasGym) return "/dashboard";
  if (to.meta.roles?.length && !to.meta.roles.includes(auth.user?.role)) return "/dashboard";
});

export default router;
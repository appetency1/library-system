import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/auth";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import StudentLayout from "../layouts/StudentLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import StudentDashboardView from "../views/StudentDashboardView.vue";
import SeatReservationView from "../views/SeatReservationView.vue";
import MyReservationsView from "../views/MyReservationsView.vue";
import NoticeCenterView from "../views/NoticeCenterView.vue";
import AdminDashboardView from "../views/admin/AdminDashboardView.vue";
import RoomManagementView from "../views/admin/RoomManagementView.vue";
import SeatManagementView from "../views/admin/SeatManagementView.vue";
import ReservationManagementView from "../views/admin/ReservationManagementView.vue";
import UserManagementView from "../views/admin/UserManagementView.vue";
import NoticeManagementView from "../views/admin/NoticeManagementView.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/app/dashboard" },
  {
    path: "/login",
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: "/register",
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: "/app",
    component: StudentLayout,
    meta: { requiresAuth: true, roles: ["student"] },
    children: [
      { path: "", redirect: "/app/dashboard" },
      { path: "dashboard", component: StudentDashboardView },
      { path: "reserve", component: SeatReservationView },
      { path: "my-reservations", component: MyReservationsView },
      { path: "notices", component: NoticeCenterView }
    ]
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ["admin"] },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      { path: "dashboard", component: AdminDashboardView },
      { path: "rooms", component: RoomManagementView },
      { path: "seats", component: SeatManagementView },
      { path: "reservations", component: ReservationManagementView },
      { path: "users", component: UserManagementView },
      { path: "notices", component: NoticeManagementView }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (!auth.ready) {
    auth.restoreSession();
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return auth.isStudent ? "/app/dashboard" : "/admin/dashboard";
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return "/login";
  }

  const roles = to.meta.roles as string[] | undefined;
  if (roles?.length && auth.user && !roles.includes(auth.user.role)) {
    return auth.isStudent ? "/app/dashboard" : "/admin/dashboard";
  }

  return true;
});

export default router;

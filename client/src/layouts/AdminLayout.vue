<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const navItems = [
  { to: "/admin/dashboard", label: "统计看板" },
  { to: "/admin/rooms", label: "阅览室" },
  { to: "/admin/seats", label: "座位" },
  { to: "/admin/reservations", label: "预约" },
  { to: "/admin/users", label: "用户" },
  { to: "/admin/notices", label: "公告" }
];

const userLabel = computed(() => auth.user?.name ?? auth.user?.username ?? "");

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <div class="app-frame">
    <aside class="side-nav admin-nav">
      <div class="brand-block">
        <div class="brand-title">图书馆座位预约系统</div>
        <div class="brand-subtitle">管理员后台</div>
      </div>

      <nav class="nav-list">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <section class="workspace">
      <header class="workspace-header">
        <div>
          <p class="eyebrow">管理员</p>
          <h1>{{ userLabel }}</h1>
        </div>

        <button class="text-button" type="button" @click="handleLogout">退出登录</button>
      </header>

      <main class="workspace-body">
        <RouterView />
      </main>
    </section>
  </div>
</template>

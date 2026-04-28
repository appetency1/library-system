<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const navItems = [
  { to: "/app/dashboard", label: "概览" },
  { to: "/app/reserve", label: "预约座位" },
  { to: "/app/my-reservations", label: "我的预约" },
  { to: "/app/notices", label: "公告中心" }
];

const userLabel = computed(() => auth.user?.name ?? auth.user?.username ?? "");

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <div class="app-frame">
    <aside class="side-nav">
      <div class="brand-block">
        <div class="brand-title">图书馆座位预约系统</div>
        <div class="brand-subtitle">学生工作台</div>
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
          <p class="eyebrow">当前登录</p>
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

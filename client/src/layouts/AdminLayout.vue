<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useTheme } from "../composables/useTheme";

const auth = useAuthStore();
const router = useRouter();
const { isDark, toggleTheme } = useTheme();

const navItems = [
  {
    to: "/admin/dashboard",
    label: "统计看板",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>`
  },
  {
    to: "/admin/rooms",
    label: "阅览室",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
  },
  {
    to: "/admin/seats",
    label: "座位",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
  },
  {
    to: "/admin/reservations",
    label: "预约",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
  },
  {
    to: "/admin/users",
    label: "用户",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
  },
  {
    to: "/admin/notices",
    label: "公告",
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`
  }
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
      <!-- Brand Section with Avatar -->
      <div class="brand-block">
        <div class="user-avatar-large">
          {{ userLabel.charAt(0).toUpperCase() }}
        </div>
        <div class="brand-info">
          <div class="brand-title">{{ userLabel }}</div>
          <div class="brand-subtitle">管理员</div>
        </div>
      </div>

      <!-- Theme Toggle -->
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
        <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <!-- Navigation -->
      <nav class="nav-list">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User Section -->
      <div class="user-section">
        <div class="user-avatar-small">
          {{ userLabel.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <span class="user-name">{{ userLabel }}</span>
          <span class="user-role">管理员</span>
        </div>
        <button class="logout-btn" type="button" @click="handleLogout" title="退出登录">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>

    <section class="workspace admin-workspace">
      <RouterView />
    </section>
  </div>
</template>

<style scoped>
/* Side Navigation - Matching Reference */
.side-nav {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1rem 0.75rem;
  background: var(--bg-secondary);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.side-nav::-webkit-scrollbar {
  width: 4px;
}

.side-nav::-webkit-scrollbar-track {
  background: transparent;
}

.side-nav::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 2px;
}

/* Brand Block - Matching Reference */
.brand-block {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: var(--radius);
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-large {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8400FF, #6B00D4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
  flex-shrink: 0;
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.brand-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-subtitle {
  color: var(--text-muted);
  font-size: 0.72rem;
}

/* Navigation List - Matching Reference */
.nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.nav-link:hover {
  background: var(--bg-tertiary);
  color: var(--text);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.nav-link:hover .nav-icon {
  background: var(--bg-elevated);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #8400FF, #6B00D4);
  color: var(--text);
  font-weight: 600;
}

.nav-link.router-link-active .nav-icon {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text);
}

.nav-label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

/* Theme Toggle Button */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0.5rem auto;
  border-radius: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.theme-toggle:hover {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent-border);
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

/* User Section - Matching Reference */
.user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-top: auto;
  border-radius: var(--radius);
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #8400FF, #6B00D4);
  color: var(--text);
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  display: block;
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.logout-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.logout-btn:hover {
  background: var(--danger-soft);
  color: var(--danger);
}

/* Workspace */
.admin-workspace {
  min-width: 0;
  padding: 1.5rem 2rem;
  background: var(--bg-primary);
}
</style>

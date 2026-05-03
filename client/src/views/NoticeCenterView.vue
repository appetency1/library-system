<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchNotices, type Notice } from "../api/library";

const notices = ref<Notice[]>([]);

onMounted(async () => {
  notices.value = await fetchNotices();
});
</script>

<template>
  <div class="workspace-page">
    <!-- Page Header -->
    <section class="page-header">
      <div class="page-header-content">
        <p class="eyebrow">公告中心</p>
        <h2>系统通知与预约提示</h2>
      </div>
      <div class="notice-count">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {{ notices.length }} 条公告
      </div>
    </section>

    <!-- Notice List -->
    <section class="content-band">
      <div class="notice-list">
        <article v-for="(notice, index) in notices" :key="notice.id" class="notice-item">
          <div class="notice-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="notice-content">
            <div class="notice-header">
              <h4>{{ notice.title }}</h4>
              <span class="notice-badge">通知</span>
            </div>
            <p>{{ notice.content }}</p>
          </div>
        </article>
      </div>

      <div v-if="notices.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <p>暂无公告</p>
        <span>稍后再来查看</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-header-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.notice-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
}

/* Notice List */
.notice-list {
  display: grid;
  gap: 1rem;
}

.notice-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}

.notice-item:hover {
  border-color: var(--accent-border);
  background: var(--glass-bg-hover);
  transform: translateX(4px);
  box-shadow: var(--glass-shadow);
}

.notice-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent);
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.notice-content h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.notice-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notice-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px dashed var(--glass-border);
  color: var(--text-muted);
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.empty-state span {
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 640px) {
  .notice-item {
    flex-direction: column;
    gap: 1rem;
  }

  .notice-icon {
    width: 40px;
    height: 40px;
  }
}
</style>

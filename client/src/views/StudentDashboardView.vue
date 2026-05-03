<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from "vue";
import { RouterLink } from "vue-router";
import { fetchMyReservations, fetchNotices, type Notice, type Reservation } from "../api/library";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const notices = ref<Notice[]>([]);
const reservations = ref<Reservation[]>([]);

// Card glow effect
const cardRefs = ref<HTMLElement[]>([]);
const mouseX = ref(0);
const mouseY = ref(0);

const registerCard = (el: HTMLElement | null) => {
  if (el && !cardRefs.value.includes(el)) {
    cardRefs.value.push(el);
  }
};

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;

  cardRefs.value.forEach(card => {
    const rect = card.getBoundingClientRect();
    const relativeX = ((mouseX.value - rect.left) / rect.width) * 100;
    const relativeY = ((mouseY.value - rect.top) / rect.height) * 100;

    let glowIntensity = 0;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(mouseX.value - centerX, mouseY.value - centerY);
    const maxDistance = Math.max(rect.width, rect.height) * 1.5;

    if (distance < maxDistance) {
      glowIntensity = Math.max(0, 1 - (distance / maxDistance));
    }

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glowIntensity.toString());
  });
};

onMounted(async () => {
  notices.value = await fetchNotices();
  reservations.value = await fetchMyReservations();
  window.addEventListener('mousemove', handleMouseMove);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});

const nextReservation = computed(() =>
  reservations.value.find((reservation) => reservation.status === "reserved") ?? null
);

const stats = computed(() => ({
  total: reservations.value.length,
  pending: reservations.value.filter((r) => r.status === "reserved").length,
  completed: reservations.value.filter((r) => r.status === "completed").length
}));
</script>

<template>
  <div class="dashboard-grid">
    <!-- Welcome Banner -->
    <section class="summary-band">
      <div class="welcome-content">
        <div class="welcome-text">
          <p class="eyebrow">欢迎回来</p>
          <h2>{{ auth.user?.name ?? auth.user?.username }}</h2>
          <p class="summary-copy">在这里查看公告、预约座位和管理你的签到记录</p>
        </div>
        <div class="welcome-glow"></div>
      </div>

      <div class="summary-actions">
        <RouterLink class="primary-button" to="/app/reserve">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          立即预约
        </RouterLink>
        <RouterLink class="secondary-button" to="/app/my-reservations">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          查看预约
        </RouterLink>
      </div>
    </section>

    <!-- Stats Grid -->
    <section class="info-grid">
      <article class="info-panel" :ref="registerCard">
        <div class="stat-icon stat-icon-total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
        </div>
        <p class="eyebrow">全部预约</p>
        <h3>{{ stats.total }}</h3>
        <p>总预约记录</p>
      </article>

      <article class="info-panel" :ref="registerCard">
        <div class="stat-icon stat-icon-pending">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <p class="eyebrow">待处理</p>
        <h3>{{ stats.pending }}</h3>
        <p>可签到或取消</p>
      </article>

      <article class="info-panel" :ref="registerCard">
        <div class="stat-icon stat-icon-next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <p class="eyebrow">下一预约</p>
        <h3 class="next-date">{{ nextReservation ? nextReservation.reserve_date : '暂无' }}</h3>
        <p>{{ nextReservation ? `${nextReservation.start_time} - ${nextReservation.end_time}` : '稍后再来查看' }}</p>
      </article>
    </section>

    <!-- Notices Section -->
    <section class="content-band">
      <div class="section-header">
        <div class="section-title-group">
          <div class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <h3>最新公告</h3>
        </div>
        <RouterLink class="text-link" to="/app/notices">
          查看全部
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </RouterLink>
      </div>

      <div class="notice-list">
        <article v-for="notice in notices.slice(0, 3)" :key="notice.id" class="notice-item" :ref="registerCard">
          <div class="notice-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div class="notice-content">
            <h4>{{ notice.title }}</h4>
            <p>{{ notice.content }}</p>
          </div>
        </article>
        <div v-if="notices.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <p>暂无公告</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Welcome Banner - Magic Bento Style */
.summary-band {
  padding: 1.5rem;
  align-items: center;
  border-radius: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
}

.summary-band::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    400px circle at 20% 50%,
    rgba(132, 0, 255, 0.1) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.welcome-content {
  flex: 1;
  position: relative;
}

.welcome-text h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
}

.summary-copy {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.summary-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.summary-actions .primary-button,
.summary-actions .secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Info Grid - Magic Bento Style */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
}

.info-panel {
  --glow-x: 50%;
  --glow-y: 50%;
  --glow-intensity: 0;
  position: relative;
  overflow: hidden;
  padding: 1.25rem;
  border-radius: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  transition: all 0.3s ease;
}

.info-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    200px circle at var(--glow-x) var(--glow-y),
    rgba(132, 0, 255, calc(var(--glow-intensity) * 0.25)) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 0;
}

.info-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: radial-gradient(
    200px circle at var(--glow-x) var(--glow-y),
    rgba(132, 0, 255, calc(var(--glow-intensity) * 0.8)) 0%,
    transparent 60%
  );
  border-radius: inherit;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.info-panel:hover {
  border-color: rgba(132, 0, 255, 0.5);
  transform: translateY(-3px);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(132, 0, 255, 0.1);
}

.info-panel > * {
  position: relative;
  z-index: 2;
}

.stat-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(132, 0, 255, 0.15);
  color: rgba(132, 0, 255, 1);
}

.stat-icon-total {
  background: rgba(132, 0, 255, 0.15);
  color: rgba(132, 0, 255, 1);
}

.stat-icon-pending {
  background: rgba(245, 158, 11, 0.15);
  color: rgba(245, 158, 11, 1);
}

.stat-icon-next {
  background: rgba(59, 130, 246, 0.15);
  color: rgba(59, 130, 246, 1);
}

.info-panel h3 {
  margin: 0.1rem 0 0.1rem;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text);
}

.next-date {
  font-size: 1.5rem !important;
}

.info-panel p:last-child,
.info-panel p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.eyebrow {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

/* Section Header - Apple Style */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--glass-border);
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(132, 0, 255, 0.15);
  color: rgba(132, 0, 255, 1);
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  color: rgba(132, 0, 255, 1);
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.text-link:hover {
  color: var(--text);
  background: rgba(132, 0, 255, 0.15);
}

/* Notice List - Magic Bento Style */
.notice-list {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem;
}

.notice-item {
  --glow-x: 50%;
  --glow-y: 50%;
  --glow-intensity: 0;
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  transition: all 0.3s ease;
  position: relative;
}

.notice-item::after {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: radial-gradient(
    150px circle at var(--glow-x) var(--glow-y),
    rgba(132, 0, 255, calc(var(--glow-intensity) * 0.6)) 0%,
    transparent 70%
  );
  border-radius: inherit;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.notice-item:hover::after {
  opacity: 1;
}

.notice-item:hover {
  border-color: rgba(132, 0, 255, 0.5);
  transform: translateX(4px);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 25px rgba(132, 0, 255, 0.1);
}

.notice-item > * {
  position: relative;
  z-index: 2;
}

.notice-badge {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(132, 0, 255, 0.15);
  color: rgba(132, 0, 255, 1);
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-content h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}

.notice-content p {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive - Apple Style */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-band {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .summary-band {
    padding: 1.25rem;
  }

  .summary-actions {
    width: 100%;
  }

  .summary-actions .primary-button,
  .summary-actions .secondary-button {
    flex: 1;
  }
}
</style>

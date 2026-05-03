<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchAdminStats, type AdminStats } from "../../api/admin";
import StatCard from "../../components/StatCard.vue";
import TrendChart from "../../components/TrendChart.vue";

const stats = ref<AdminStats | null>(null);

onMounted(async () => {
  stats.value = await fetchAdminStats();
});
</script>

<template>
  <div class="workspace-page">
    <!-- Page Header -->
    <section class="page-header">
      <div class="page-header-content">
        <p class="eyebrow">统计看板</p>
        <h2>座位使用与预约趋势</h2>
      </div>
    </section>

    <!-- Stats Grid -->
    <section v-if="stats" class="info-grid">
      <StatCard 
        label="今日预约" 
        :value="stats.todayReservations" 
        hint="含已签到和已完成"
        variant="info"
      >
        <template #icon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </template>
      </StatCard>
      <StatCard 
        label="签到率" 
        :value="`${stats.checkinRate}%`" 
        hint="今日有效预约"
        variant="success"
      >
        <template #icon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </template>
      </StatCard>
      <StatCard 
        label="座位使用率" 
        :value="`${stats.seatUtilization}%`" 
        hint="当前有效预约占比"
        variant="warning"
      >
        <template #icon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
        </template>
      </StatCard>
    </section>

    <!-- Chart Section -->
    <section v-if="stats" class="content-band">
      <div class="section-header">
        <div class="section-title-group">
          <div class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
          </div>
          <div>
            <h3>近 7 日趋势</h3>
            <p class="section-subtitle">预约数与签到数对比</p>
          </div>
        </div>
      </div>
      <TrendChart :data="stats.sevenDayTrend" />
    </section>

    <!-- Top Rooms Section -->
    <section v-if="stats" class="content-band">
      <div class="section-header">
        <div class="section-title-group">
          <div class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <h3>热门阅览室</h3>
            <p class="section-subtitle">预约次数排行</p>
          </div>
        </div>
      </div>

      <div class="room-list">
        <article v-for="(room, index) in stats.topRooms" :key="room.room_id" class="list-row">
          <div class="room-rank" :class="[`rank-${index + 1}`]">{{ index + 1 }}</div>
          <div class="room-info">
            <h4>{{ room.room_name }}</h4>
          </div>
          <div class="room-stats">
            <span class="room-count">{{ room.reservation_count }}</span>
            <span class="room-label">次预约</span>
          </div>
          <div class="room-bar">
            <div 
              class="room-bar-fill" 
              :style="{ width: `${(room.reservation_count / (stats.topRooms[0]?.reservation_count || 1)) * 100}%` }"
            ></div>
          </div>
        </article>
        <div v-if="stats.topRooms.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <p>暂无预约数据</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Page Header */
.page-header {
  margin-bottom: 1.5rem;
}

.page-header-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, var(--info));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Stats Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--info-soft);
  color: var(--info);
}

.section-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.section-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Room List */
.room-list {
  display: grid;
  gap: 0.75rem;
}

.list-row {
  display: grid;
  grid-template-columns: 40px 1fr auto 120px;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}

.list-row:hover {
  border-color: var(--info);
  background: var(--glass-bg-hover);
  transform: translateX(4px);
  box-shadow: var(--glass-shadow);
}

.room-rank {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.95rem;
  background: var(--glass-bg);
  color: var(--text-secondary);
}

.room-rank.rank-1 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.room-rank.rank-2 {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  color: #fff;
  box-shadow: 0 4px 12px rgba(148, 163, 184, 0.3);
}

.room-rank.rank-3 {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #fff;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}

.room-info h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.room-stats {
  text-align: right;
}

.room-count {
  display: block;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--info);
}

.room-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.room-bar {
  height: 6px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.room-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--info), #60a5fa);
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .list-row {
    grid-template-columns: 36px 1fr auto;
    gap: 0.75rem;
  }

  .room-bar {
    display: none;
  }
}

@media (max-width: 480px) {
  .list-row {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .room-rank {
    margin: 0 auto;
  }

  .room-stats {
    text-align: center;
  }
}
</style>

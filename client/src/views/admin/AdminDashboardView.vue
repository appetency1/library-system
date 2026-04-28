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
    <section class="page-header">
      <div>
        <p class="eyebrow">统计看板</p>
        <h2>座位使用与预约趋势</h2>
      </div>
    </section>

    <section v-if="stats" class="info-grid">
      <StatCard label="今日预约" :value="stats.todayReservations" hint="含已签到和已完成" />
      <StatCard label="签到率" :value="`${stats.checkinRate}%`" hint="今日有效预约" />
      <StatCard label="座位使用率" :value="`${stats.seatUtilization}%`" hint="当前有效预约占比" />
    </section>

    <section v-if="stats" class="content-band">
      <div class="section-header">
        <h3>近 7 日趋势</h3>
        <p class="muted">预约数与签到数</p>
      </div>
      <TrendChart :data="stats.sevenDayTrend" />
    </section>

    <section v-if="stats" class="content-band">
      <div class="section-header">
        <h3>热门阅览室</h3>
      </div>
      <article v-for="room in stats.topRooms" :key="room.room_id" class="list-row">
        <span>{{ room.room_name }}</span>
        <strong>{{ room.reservation_count }} 次预约</strong>
      </article>
      <p v-if="stats.topRooms.length === 0" class="empty-state">暂无预约数据。</p>
    </section>
  </div>
</template>

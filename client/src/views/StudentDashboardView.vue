<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { fetchMyReservations, fetchNotices, type Notice, type Reservation } from "../api/library";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const notices = ref<Notice[]>([]);
const reservations = ref<Reservation[]>([]);

const nextReservation = computed(() =>
  reservations.value.find((reservation) => reservation.status === "reserved") ?? null
);

onMounted(async () => {
  notices.value = await fetchNotices();
  reservations.value = await fetchMyReservations();
});
</script>

<template>
  <div class="dashboard-grid">
    <section class="summary-band">
      <div>
        <p class="eyebrow">欢迎回来</p>
        <h2>{{ auth.user?.name }}</h2>
        <p class="summary-copy">在这里查看公告、预约座位和管理你的签到记录。</p>
      </div>

      <div class="summary-actions">
        <RouterLink class="primary-button" to="/app/reserve">立即预约</RouterLink>
        <RouterLink class="secondary-button" to="/app/my-reservations">查看预约</RouterLink>
      </div>
    </section>

    <section class="info-grid">
      <article class="info-panel">
        <p class="eyebrow">当前预约</p>
        <h3>{{ reservations.length }}</h3>
        <p>全部预约记录</p>
      </article>

      <article class="info-panel">
        <p class="eyebrow">待处理预约</p>
        <h3>{{ reservations.filter((reservation) => reservation.status === 'reserved').length }}</h3>
        <p>可签到或取消</p>
      </article>

      <article class="info-panel">
        <p class="eyebrow">下一条预约</p>
        <h3>{{ nextReservation ? nextReservation.reserve_date : '暂无' }}</h3>
        <p>{{ nextReservation ? `${nextReservation.start_time} - ${nextReservation.end_time}` : '稍后再来查看' }}</p>
      </article>
    </section>

    <section class="content-band">
      <div class="section-header">
        <h3>最新公告</h3>
        <RouterLink class="text-link" to="/app/notices">查看全部</RouterLink>
      </div>

      <div class="notice-list">
        <article v-for="notice in notices.slice(0, 3)" :key="notice.id" class="notice-item">
          <h4>{{ notice.title }}</h4>
          <p>{{ notice.content }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

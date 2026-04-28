<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  adminCancelReservation,
  fetchAdminReservations
} from "../../api/admin";
import type { Reservation } from "../../api/library";

const reservations = ref<Reservation[]>([]);
const message = ref("");

async function loadReservations() {
  reservations.value = await fetchAdminReservations();
}

onMounted(loadReservations);

async function cancelReservation(reservationId: number) {
  message.value = "";
  await adminCancelReservation(reservationId);
  await loadReservations();
  message.value = "预约已取消。";
}
</script>

<template>
  <div class="workspace-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">预约管理</p>
        <h2>查看并处理异常预约</h2>
      </div>
      <p class="muted">{{ message }}</p>
    </section>

    <section class="content-band">
      <article v-for="reservation in reservations" :key="reservation.id" class="list-row">
        <div>
          <strong>#{{ reservation.id }} · 用户 {{ reservation.user_id }}</strong>
          <p>
            座位 {{ reservation.seat_id }} · {{ reservation.reserve_date }}
            {{ reservation.start_time }} - {{ reservation.end_time }}
          </p>
        </div>
        <button
          v-if="reservation.status === 'reserved' || reservation.status === 'checked_in'"
          class="ghost-button"
          type="button"
          @click="cancelReservation(reservation.id)"
        >
          强制取消
        </button>
        <span v-else class="status-pill">{{ reservation.status }}</span>
      </article>
      <p v-if="reservations.length === 0" class="empty-state">暂无预约记录。</p>
    </section>
  </div>
</template>

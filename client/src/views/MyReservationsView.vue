<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  fetchMyReservations,
  type Reservation
} from "../api/library";

const reservations = ref<Reservation[]>([]);
const message = ref("");

async function loadReservations() {
  reservations.value = await fetchMyReservations();
}

onMounted(loadReservations);

async function handleAction(action: "cancel" | "checkin" | "checkout", reservationId: number) {
  message.value = "";
  try {
    if (action === "cancel") {
      await cancelReservation(reservationId);
    } else if (action === "checkin") {
      await checkInReservation(reservationId);
    } else {
      await checkOutReservation(reservationId);
    }
    await loadReservations();
    message.value = "操作成功。";
  } catch (error) {
    message.value = error instanceof Error ? error.message : "操作失败。";
  }
}
</script>

<template>
  <div class="workspace-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">我的预约</p>
        <h2>管理签到、签退与取消</h2>
      </div>
      <p class="muted">{{ message }}</p>
    </section>

    <section class="content-band">
      <article v-for="reservation in reservations" :key="reservation.id" class="reservation-row">
        <div>
          <h4>{{ reservation.reserve_date }}</h4>
          <p>{{ reservation.start_time }} - {{ reservation.end_time }}</p>
        </div>

        <div>
          <p>座位 {{ reservation.seat_id }}</p>
          <p class="status-pill">{{ reservation.status }}</p>
        </div>

        <div class="row-actions">
          <button
            v-if="reservation.status === 'reserved'"
            class="secondary-button"
            type="button"
            @click="handleAction('checkin', reservation.id)"
          >
            签到
          </button>
          <button
            v-if="reservation.status === 'checked_in'"
            class="secondary-button"
            type="button"
            @click="handleAction('checkout', reservation.id)"
          >
            签退
          </button>
          <button
            v-if="reservation.status === 'reserved'"
            class="ghost-button"
            type="button"
            @click="handleAction('cancel', reservation.id)"
          >
            取消
          </button>
        </div>
      </article>

      <p v-if="reservations.length === 0" class="empty-state">暂无预约记录。</p>
    </section>
  </div>
</template>

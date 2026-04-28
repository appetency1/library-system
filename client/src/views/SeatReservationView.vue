<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import SeatGrid from "../components/SeatGrid.vue";
import {
  createReservation,
  fetchRooms,
  fetchSeats,
  type Room,
  type Seat
} from "../api/library";

const rooms = ref<Room[]>([]);
const seats = ref<Seat[]>([]);
const selectedRoomId = ref<number | null>(null);
const selectedSeatId = ref<number | null>(null);
const reserveDate = ref(new Date().toISOString().slice(0, 10));
const startTime = ref("09:00");
const endTime = ref("11:00");
const message = ref("");
const loading = ref(false);

const selectedRoom = computed(
  () => rooms.value.find((room) => room.id === selectedRoomId.value) ?? null
);

async function loadRooms() {
  rooms.value = await fetchRooms();
  if (!selectedRoomId.value && rooms.value.length > 0) {
    selectedRoomId.value = rooms.value[0].id;
  }
}

async function loadSeats() {
  if (!selectedRoomId.value) {
    seats.value = [];
    return;
  }

  seats.value = await fetchSeats({
    roomId: selectedRoomId.value,
    reserveDate: reserveDate.value,
    startTime: startTime.value,
    endTime: endTime.value
  });

  if (!seats.value.some((seat) => seat.id === selectedSeatId.value && seat.available)) {
    selectedSeatId.value = seats.value.find((seat) => seat.available)?.id ?? null;
  }
}

onMounted(async () => {
  await loadRooms();
  await loadSeats();
});

watch([selectedRoomId, reserveDate, startTime, endTime], async () => {
  await loadSeats();
});

async function submitReservation() {
  if (!selectedSeatId.value) {
    message.value = "请先选择一个可用座位。";
    return;
  }

  loading.value = true;
  message.value = "";
  try {
    await createReservation({
      seatId: selectedSeatId.value,
      reserveDate: reserveDate.value,
      startTime: startTime.value,
      endTime: endTime.value
    });
    message.value = "预约成功。";
    await loadSeats();
  } catch (error) {
    message.value = error instanceof Error ? error.message : "预约失败。";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="workspace-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">座位预约</p>
        <h2>选择阅览室、时间段和座位</h2>
      </div>

      <button class="primary-button" type="button" @click="submitReservation" :disabled="loading">
        {{ loading ? "提交中..." : "确认预约" }}
      </button>
    </section>

    <section class="filter-strip">
      <div class="room-toggle">
        <button
          v-for="room in rooms"
          :key="room.id"
          type="button"
          class="toggle-button"
          :class="{ active: selectedRoomId === room.id }"
          @click="selectedRoomId = room.id"
        >
          {{ room.name }}
        </button>
      </div>

      <label>
        <span>日期</span>
        <input v-model="reserveDate" type="date" />
      </label>

      <label>
        <span>开始</span>
        <input v-model="startTime" type="time" />
      </label>

      <label>
        <span>结束</span>
        <input v-model="endTime" type="time" />
      </label>
    </section>

    <section class="content-band">
      <div class="section-header">
        <div>
          <h3>{{ selectedRoom?.name ?? "阅览室" }}</h3>
          <p>{{ selectedRoom?.location }}</p>
        </div>
        <p class="muted">可预约座位会高亮显示</p>
      </div>

      <SeatGrid
        :seats="seats"
        :selected-seat-id="selectedSeatId"
        @select="selectedSeatId = $event"
      />

      <p class="form-hint">{{ message }}</p>
    </section>
  </div>
</template>

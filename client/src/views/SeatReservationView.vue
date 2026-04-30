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
import { getApiErrorMessage } from "../api/error";

interface TimeSlotPreset {
  label: string;
  startTime: string;
  endTime: string;
}

function formatLocalDate(reference = new Date()): string {
  const offset = reference.getTimezoneOffset() * 60_000;
  return new Date(reference.getTime() - offset).toISOString().slice(0, 10);
}

const timeSlotPresets: TimeSlotPreset[] = [
  { label: "上午 08:00-10:00", startTime: "08:00", endTime: "10:00" },
  { label: "上午 10:00-12:00", startTime: "10:00", endTime: "12:00" },
  { label: "下午 14:00-16:00", startTime: "14:00", endTime: "16:00" },
  { label: "下午 16:00-18:00", startTime: "16:00", endTime: "18:00" },
  { label: "晚上 19:00-21:00", startTime: "19:00", endTime: "21:00" }
];

const rooms = ref<Room[]>([]);
const seats = ref<Seat[]>([]);
const selectedRoomId = ref<number | null>(null);
const selectedSeatId = ref<number | null>(null);
const reserveDate = ref(formatLocalDate());
const startTime = ref("09:00");
const endTime = ref("11:00");
const message = ref("");
const messageTone = ref<"success" | "error" | "">("");
const loading = ref(false);

const selectedRoom = computed(
  () => rooms.value.find((room) => room.id === selectedRoomId.value) ?? null
);

const activePreset = computed(
  () =>
    timeSlotPresets.find(
      (preset) => preset.startTime === startTime.value && preset.endTime === endTime.value
    ) ?? null
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

function applyPreset(preset: TimeSlotPreset) {
  startTime.value = preset.startTime;
  endTime.value = preset.endTime;
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
    message.value = "请选择一个可用座位。";
    messageTone.value = "error";
    return;
  }

  loading.value = true;
  message.value = "";
  messageTone.value = "";
  try {
    await createReservation({
      seatId: selectedSeatId.value,
      reserveDate: reserveDate.value,
      startTime: startTime.value,
      endTime: endTime.value
    });
    message.value = "预约成功。";
    messageTone.value = "success";
    await loadSeats();
  } catch (error) {
    message.value = getApiErrorMessage(error, "预约失败，请稍后重试。");
    messageTone.value = "error";
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
        <h2>选择阅览室、时段和座位</h2>
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

      <div class="time-slot-presets">
        <span class="preset-label">快捷时段</span>
        <div class="preset-list">
          <button
            v-for="preset in timeSlotPresets"
            :key="preset.label"
            type="button"
            class="preset-button"
            :class="{ active: activePreset?.label === preset.label }"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>
        <p class="muted">
          {{ activePreset ? "已选 " + activePreset.label : "可直接输入自定义时段。" }}
        </p>
      </div>
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

      <div v-if="message" class="reservation-feedback" :class="messageTone">
        <span class="reservation-feedback-label">
          {{ messageTone === "success" ? "预约成功" : "预约提示" }}
        </span>
        <p>{{ message }}</p>
      </div>
    </section>
  </div>
</template>

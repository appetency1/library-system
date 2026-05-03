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

const availableCount = computed(() => seats.value.filter(s => s.available).length);

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
    <!-- Page Header -->
    <section class="page-header">
      <div class="page-header-content">
        <p class="eyebrow">座位预约</p>
        <h2>选择阅览室、时段和座位</h2>
      </div>

      <button class="primary-button reserve-btn" type="button" @click="submitReservation" :disabled="loading">
        <span v-if="loading" class="btn-loading">
          <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          提交中...
        </span>
        <span v-else>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          确认预约
        </span>
      </button>
    </section>

    <!-- Filter Section -->
    <section class="filter-strip">
      <!-- Room Selection -->
      <div class="filter-section">
        <label class="filter-label">选择阅览室</label>
        <div class="room-toggle">
          <button
            v-for="room in rooms"
            :key="room.id"
            type="button"
            class="toggle-button"
            :class="{ active: selectedRoomId === room.id }"
            @click="selectedRoomId = room.id"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            {{ room.name }}
          </button>
        </div>
      </div>

      <!-- Time Selection -->
      <div class="filter-row">
        <label class="filter-field">
          <span class="filter-label">日期</span>
          <input v-model="reserveDate" type="date" />
        </label>

        <label class="filter-field">
          <span class="filter-label">开始时间</span>
          <input v-model="startTime" type="time" />
        </label>

        <label class="filter-field">
          <span class="filter-label">结束时间</span>
          <input v-model="endTime" type="time" />
        </label>
      </div>

      <!-- Presets -->
      <div class="filter-section presets-section">
        <span class="filter-label">快捷时段</span>
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
        <p class="muted preset-hint">
          {{ activePreset ? "已选 " + activePreset.label : "可直接输入自定义时段" }}
        </p>
      </div>
    </section>

    <!-- Seat Grid Section -->
    <section class="content-band">
      <div class="section-header">
        <div class="section-title-group">
          <div class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div>
            <h3>{{ selectedRoom?.name ?? "阅览室" }}</h3>
            <p class="section-subtitle">{{ selectedRoom?.location }}</p>
          </div>
        </div>
        <div class="seat-stats">
          <span class="stat-badge available">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ availableCount }} 可用
          </span>
          <span class="stat-badge total">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            </svg>
            {{ seats.length }} 总计
          </span>
        </div>
      </div>

      <SeatGrid
        :seats="seats"
        :selected-seat-id="selectedSeatId"
        @select="selectedSeatId = $event"
      />

      <!-- Feedback Message -->
      <div v-if="message" class="reservation-feedback" :class="messageTone">
        <div class="feedback-icon">
          <svg v-if="messageTone === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="16 10 10.5 15.5 8 13"></polyline>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="feedback-content">
          <span class="reservation-feedback-label">
            {{ messageTone === "success" ? "预约成功" : "预约提示" }}
          </span>
          <p>{{ message }}</p>
        </div>
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
  gap: 1.5rem;
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

.reserve-btn {
  min-width: 160px;
}

.reserve-btn span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Filter Section */
.filter-strip {
  display: grid;
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  margin-bottom: 1.25rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-field {
  flex: 1;
  min-width: 140px;
}

.presets-section {
  gap: 0.5rem;
}

.preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

/* Room Toggle */
.room-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.toggle-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-secondary);
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}

.toggle-button:hover {
  border-color: var(--accent-border);
  color: var(--accent);
  background: var(--accent-soft);
}

.toggle-button.active {
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #fff;
  box-shadow: 0 8px 24px var(--accent-glow);
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
  background: var(--accent-soft);
  color: var(--accent);
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

.seat-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.stat-badge.available {
  background: var(--success-soft);
  color: var(--success);
}

.stat-badge.total {
  background: var(--glass-bg);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

/* Reservation Feedback */
.reservation-feedback {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1.25rem;
  border-radius: var(--radius);
  border: 1px solid transparent;
}

.feedback-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.feedback-content {
  flex: 1;
}

.reservation-feedback-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.reservation-feedback p {
  margin: 0;
  font-size: 0.92rem;
}

.reservation-feedback.success {
  background: var(--success-soft);
  border-color: rgba(34, 197, 94, 0.3);
}

.reservation-feedback.success .feedback-icon {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.reservation-feedback.success .reservation-feedback-label,
.reservation-feedback.success p {
  color: var(--success);
}

.reservation-feedback.error {
  background: var(--danger-soft);
  border-color: rgba(239, 68, 68, 0.3);
}

.reservation-feedback.error .feedback-icon {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.reservation-feedback.error .reservation-feedback-label,
.reservation-feedback.error p {
  color: var(--danger);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .reserve-btn {
    width: 100%;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-field {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

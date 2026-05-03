<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  fetchMyReservations,
  type Reservation
} from "../api/library";
import { getApiErrorMessage } from "../api/error";

type ReservationStatusFilter = "all" | Reservation["status"];

const reservations = ref<Reservation[]>([]);
const message = ref("");
const statusFilter = ref<ReservationStatusFilter>("all");
const dateFrom = ref("");
const dateTo = ref("");
const keyword = ref("");

const statusOptions: Array<{ label: string; value: ReservationStatusFilter }> = [
  { label: "全部状态", value: "all" },
  { label: "已预约", value: "reserved" },
  { label: "已签到", value: "checked_in" },
  { label: "已完成", value: "completed" },
  { label: "已取消", value: "cancelled" },
  { label: "已过期", value: "expired" }
];

const statusLabels: Record<Reservation["status"], string> = {
  reserved: "已预约",
  checked_in: "已签到",
  completed: "已完成",
  cancelled: "已取消",
  expired: "已过期"
};

async function loadReservations() {
  reservations.value = await fetchMyReservations();
}

const filteredReservations = computed(() => {
  const query = keyword.value.trim().toLowerCase();

  return reservations.value.filter((reservation) => {
    if (statusFilter.value !== "all" && reservation.status !== statusFilter.value) {
      return false;
    }

    if (dateFrom.value && reservation.reserve_date < dateFrom.value) {
      return false;
    }

    if (dateTo.value && reservation.reserve_date > dateTo.value) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      reservation.id.toString(),
      reservation.reserve_date,
      reservation.start_time,
      reservation.end_time,
      reservation.status,
      reservation.seat_id.toString(),
      reservation.room_id.toString(),
      reservation.room_name ?? "",
      reservation.room_location ?? "",
      reservation.seat_no ?? ""
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
});

const hasInvalidDateRange = computed(
  () => Boolean(dateFrom.value && dateTo.value && dateFrom.value > dateTo.value)
);

const activeFilterCount = computed(() => {
  let count = 0;
  if (statusFilter.value !== "all") count += 1;
  if (dateFrom.value) count += 1;
  if (dateTo.value) count += 1;
  if (keyword.value.trim()) count += 1;
  return count;
});

const filterHint = computed(() => {
  if (hasInvalidDateRange.value) {
    return "开始日期不能晚于结束日期。";
  }
  if (activeFilterCount.value === 0) {
    return "可以按状态、日期范围和关键词筛选预约。";
  }
  return `当前显示 ${filteredReservations.value.length} 条记录。`;
});

function resetFilters() {
  statusFilter.value = "all";
  dateFrom.value = "";
  dateTo.value = "";
  keyword.value = "";
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
    message.value = getApiErrorMessage(error, "操作失败，请稍后重试。");
  }
}
</script>

<template>
  <div class="workspace-page">
    <!-- Page Header -->
    <section class="page-header">
      <div class="page-header-content">
        <p class="eyebrow">我的预约</p>
        <h2>管理签到、签退与取消</h2>
      </div>
      <p v-if="message" class="page-message" :class="{ error: message.includes('失败') }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="16 10 10.5 15.5 8 13"></polyline>
        </svg>
        {{ message }}
      </p>
    </section>

    <!-- Filter Section -->
    <section class="filter-section">
      <div class="filter-row">
        <label class="filter-field">
          <span class="filter-label">状态</span>
          <select v-model="statusFilter">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="filter-field">
          <span class="filter-label">开始日期</span>
          <input v-model="dateFrom" type="date" />
        </label>

        <label class="filter-field">
          <span class="filter-label">结束日期</span>
          <input v-model="dateTo" type="date" />
        </label>

        <label class="filter-field filter-field-search">
          <span class="filter-label">关键词</span>
          <div class="search-input-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input v-model="keyword" type="search" placeholder="预约号、日期、座位..." />
          </div>
        </label>

        <button class="ghost-button reset-btn" type="button" @click="resetFilters">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          重置
        </button>
      </div>
    </section>

    <!-- Content Section -->
    <section class="content-band">
      <div class="section-header">
        <div class="section-title-group">
          <div class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <h3>预约列表</h3>
            <p class="section-subtitle">
              {{ reservations.length }} 条记录 · 当前显示 {{ filteredReservations.length }} 条
            </p>
          </div>
        </div>
        <p class="filter-hint">{{ filterHint }}</p>
      </div>

      <div class="reservation-list">
        <article
          v-for="reservation in filteredReservations"
          :key="reservation.id"
          class="reservation-card"
        >
          <div class="reservation-main">
            <div class="reservation-date">
              <span class="date-day">{{ reservation.reserve_date.split('-')[2] }}</span>
              <span class="date-month">{{ reservation.reserve_date.slice(0, 7) }}</span>
            </div>
            <div class="reservation-details">
              <h4>{{ reservation.start_time }} - {{ reservation.end_time }}</h4>
              <p class="reservation-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                {{ reservation.room_name ?? `阅览室 ${reservation.room_id}` }}
                <span v-if="reservation.seat_no">· {{ reservation.seat_no }}</span>
                <span v-else>· 座位 {{ reservation.seat_id }}</span>
              </p>
            </div>
          </div>

          <div class="reservation-meta">
            <span class="reservation-id">#{{ reservation.id }}</span>
            <span class="status-pill" :class="reservation.status">
              {{ statusLabels[reservation.status] }}
            </span>
          </div>

          <div class="row-actions">
            <button
              v-if="reservation.status === 'reserved'"
              class="action-button checkin"
              type="button"
              @click="handleAction('checkin', reservation.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              签到
            </button>
            <button
              v-if="reservation.status === 'checked_in'"
              class="action-button checkout"
              type="button"
              @click="handleAction('checkout', reservation.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              签退
            </button>
            <button
              v-if="reservation.status === 'reserved'"
              class="action-button cancel"
              type="button"
              @click="handleAction('cancel', reservation.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              取消
            </button>
          </div>
        </article>
      </div>

      <div v-if="filteredReservations.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>{{ reservations.length === 0 ? "暂无预约记录" : "暂无符合条件的预约记录" }}</p>
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

.page-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--success-soft);
  color: var(--success);
  font-weight: 600;
  font-size: 0.9rem;
}

.page-message.error {
  background: var(--danger-soft);
  color: var(--danger);
}

/* Filter Section */
.filter-section {
  padding: 1.5rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  margin-bottom: 1.25rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-field {
  flex: 1;
  min-width: 140px;
}

.filter-field-search {
  flex: 2;
}

.filter-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input-wrapper input {
  padding-left: 42px;
}

.reset-btn {
  min-width: auto;
  padding: 0.7rem 1rem;
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

.filter-hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Reservation List */
.reservation-list {
  display: grid;
  gap: 1rem;
}

.reservation-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
}

.reservation-card:hover {
  border-color: var(--accent-border);
  background: var(--glass-bg-hover);
  transform: translateX(4px);
  box-shadow: var(--glass-shadow);
}

.reservation-main {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.reservation-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-soft), rgba(20, 184, 166, 0.15));
  border: 1px solid var(--accent-border);
}

.date-day {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}

.date-month {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
}

.reservation-details h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.reservation-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.4rem 0 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.reservation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.reservation-id {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.row-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.25s ease;
}

.action-button.checkin {
  background: var(--success-soft);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.action-button.checkin:hover {
  background: rgba(34, 197, 94, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.action-button.checkout {
  background: var(--info-soft);
  color: var(--info);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.action-button.checkout:hover {
  background: rgba(59, 130, 246, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.action-button.cancel {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--glass-border);
}

.action-button.cancel:hover {
  background: var(--danger-soft);
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px dashed var(--glass-border);
  color: var(--text-muted);
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .reservation-card {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .reservation-meta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .row-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .filter-row {
    flex-direction: column;
  }

  .filter-field {
    width: 100%;
  }

  .reservation-main {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

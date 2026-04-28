<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  fetchMyReservations,
  type Reservation
} from "../api/library";

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

function getReservationSummary(reservation: Reservation): string {
  const parts = [
    `预约号 ${reservation.id}`,
    reservation.room_name ? `${reservation.room_name}${reservation.seat_no ? ` · ${reservation.seat_no}` : ""}` : `座位 ${reservation.seat_id}`,
    reservation.reserve_date,
    `${reservation.start_time}-${reservation.end_time}`,
    statusLabels[reservation.status]
  ];
  return parts.join(" ");
}

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

    <section class="filter-strip reservation-filter-strip">
      <label>
        <span>状态</span>
        <select v-model="statusFilter">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label>
        <span>开始日期</span>
        <input v-model="dateFrom" type="date" />
      </label>

      <label>
        <span>结束日期</span>
        <input v-model="dateTo" type="date" />
      </label>

      <label class="reservation-keyword">
        <span>关键词</span>
        <input v-model="keyword" type="search" placeholder="预约号、日期、座位、阅览室" />
      </label>

      <button class="secondary-button" type="button" @click="resetFilters">重置筛选</button>
    </section>

    <section class="content-band">
      <div class="section-header reservation-summary">
        <div>
          <h3>预约列表</h3>
          <p class="muted">
            {{ reservations.length }} 条记录，当前显示 {{ filteredReservations.length }} 条
          </p>
        </div>
        <p class="muted">{{ filterHint }}</p>
      </div>

      <article
        v-for="reservation in filteredReservations"
        :key="reservation.id"
        class="reservation-row reservation-card"
      >
        <div class="reservation-main">
          <h4>{{ reservation.reserve_date }}</h4>
          <p>{{ reservation.start_time }} - {{ reservation.end_time }}</p>
          <p>
            {{ reservation.room_name ?? `阅览室 ${reservation.room_id}` }}
            <span v-if="reservation.seat_no">
              · {{ reservation.seat_no }}
            </span>
            <span v-else> · 座位 {{ reservation.seat_id }}</span>
          </p>
        </div>

        <div class="reservation-meta">
          <p>预约号 {{ reservation.id }}</p>
          <p class="status-pill">{{ statusLabels[reservation.status] }}</p>
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

      <p v-if="filteredReservations.length === 0" class="empty-state">
        {{ reservations.length === 0 ? "暂无预约记录。" : "暂无符合条件的预约记录。" }}
      </p>
    </section>
  </div>
</template>

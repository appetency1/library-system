<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  adminCancelReservation,
  fetchAdminReservations
} from "../../api/admin";
import { getApiErrorMessage } from "../../api/error";
import type { Reservation } from "../../api/library";

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
  reservations.value = await fetchAdminReservations();
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
      reservation.user_id.toString(),
      reservation.reserve_date,
      reservation.start_time,
      reservation.end_time,
      reservation.status,
      reservation.room_id.toString(),
      reservation.seat_id.toString(),
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
    return "可以按状态、日期范围和关键词筛选全校预约。";
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

async function cancelReservation(reservationId: number) {
  message.value = "";
  try {
    await adminCancelReservation(reservationId);
    await loadReservations();
    message.value = "预约已强制取消。";
  } catch (error) {
    message.value = getApiErrorMessage(error, "操作失败，请稍后重试。");
  }
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
        <input v-model="keyword" type="search" placeholder="预约号、用户、阅览室、座位" />
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
        class="list-row reservation-card"
      >
        <div class="reservation-main">
          <strong>#{{ reservation.id }} · 用户 {{ reservation.user_id }}</strong>
          <p>
            {{ reservation.room_name ?? `阅览室 ${reservation.room_id}` }}
            <span v-if="reservation.seat_no"> · {{ reservation.seat_no }}</span>
            <span v-else> · 座位 {{ reservation.seat_id }}</span>
          </p>
          <p>{{ reservation.reserve_date }} {{ reservation.start_time }} - {{ reservation.end_time }}</p>
        </div>

        <div class="reservation-meta">
          <p class="status-pill" :class="reservation.status">{{ statusLabels[reservation.status] }}</p>
        </div>

        <button
          v-if="reservation.status === 'reserved' || reservation.status === 'checked_in'"
          class="ghost-button"
          type="button"
          @click="cancelReservation(reservation.id)"
        >
          强制取消
        </button>
      </article>

      <p v-if="filteredReservations.length === 0" class="empty-state">
        {{ reservations.length === 0 ? "暂无预约记录。" : "暂无符合条件的预约记录。" }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  createAdminSeat,
  fetchAdminRooms,
  fetchAdminSeats,
  updateAdminSeat,
  type AdminSeat,
  type SeatPayload
} from "../../api/admin";
import type { Room } from "../../api/library";

const rooms = ref<Room[]>([]);
const seats = ref<AdminSeat[]>([]);
const message = ref("");
const form = reactive<SeatPayload>({
  room_id: 1,
  seat_no: "",
  type: "普通座",
  status: "active"
});

async function loadData() {
  rooms.value = await fetchAdminRooms();
  seats.value = await fetchAdminSeats();
  if (rooms.value.length > 0 && !rooms.value.some((room) => room.id === form.room_id)) {
    form.room_id = rooms.value[0].id;
  }
}

onMounted(loadData);

async function createSeat() {
  message.value = "";
  await createAdminSeat(form);
  form.seat_no = "";
  form.type = "普通座";
  await loadData();
  message.value = "座位已新增。";
}

async function toggleSeat(seat: AdminSeat) {
  await updateAdminSeat(seat.id, {
    room_id: seat.room_id,
    seat_no: seat.seat_no,
    type: seat.type,
    status: seat.status === "active" ? "disabled" : "active"
  });
  await loadData();
}
</script>

<template>
  <div class="workspace-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">座位管理</p>
        <h2>维护座位编号与状态</h2>
      </div>
      <p class="muted">{{ message }}</p>
    </section>

    <form class="management-form" @submit.prevent="createSeat">
      <label>
        <span>阅览室</span>
        <select v-model.number="form.room_id">
          <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
        </select>
      </label>
      <label><span>编号</span><input v-model="form.seat_no" required /></label>
      <label><span>类型</span><input v-model="form.type" required /></label>
      <button class="primary-button" type="submit">新增</button>
    </form>

    <section class="content-band">
      <article v-for="seat in seats" :key="seat.id" class="list-row">
        <div>
          <strong>{{ seat.seat_no }}</strong>
          <p>{{ seat.room_name }} · {{ seat.type }} · {{ seat.status }}</p>
        </div>
        <button class="secondary-button" type="button" @click="toggleSeat(seat)">
          {{ seat.status === "active" ? "停用" : "启用" }}
        </button>
      </article>
    </section>
  </div>
</template>

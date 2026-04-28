<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  createAdminRoom,
  fetchAdminRooms,
  updateAdminRoom,
  type RoomPayload
} from "../../api/admin";
import type { Room } from "../../api/library";

const rooms = ref<Room[]>([]);
const message = ref("");
const form = reactive<RoomPayload>({
  name: "",
  location: "",
  description: "",
  status: "active"
});

async function loadRooms() {
  rooms.value = await fetchAdminRooms();
}

onMounted(loadRooms);

async function createRoom() {
  message.value = "";
  await createAdminRoom(form);
  Object.assign(form, { name: "", location: "", description: "", status: "active" });
  await loadRooms();
  message.value = "阅览室已新增。";
}

async function toggleRoom(room: Room) {
  await updateAdminRoom(room.id, {
    name: room.name,
    location: room.location,
    description: room.description,
    status: room.status === "active" ? "disabled" : "active"
  });
  await loadRooms();
}
</script>

<template>
  <div class="workspace-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">阅览室管理</p>
        <h2>维护阅览室基础信息</h2>
      </div>
      <p class="muted">{{ message }}</p>
    </section>

    <form class="management-form" @submit.prevent="createRoom">
      <label><span>名称</span><input v-model="form.name" required /></label>
      <label><span>位置</span><input v-model="form.location" required /></label>
      <label><span>描述</span><input v-model="form.description" required /></label>
      <button class="primary-button" type="submit">新增</button>
    </form>

    <section class="content-band">
      <article v-for="room in rooms" :key="room.id" class="list-row">
        <div>
          <strong>{{ room.name }}</strong>
          <p>{{ room.location }} · {{ room.description }}</p>
        </div>
        <button class="secondary-button" type="button" @click="toggleRoom(room)">
          {{ room.status === "active" ? "停用" : "启用" }}
        </button>
      </article>
    </section>
  </div>
</template>

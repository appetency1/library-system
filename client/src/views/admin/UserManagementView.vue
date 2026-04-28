<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { AuthUser } from "../../api/auth";
import { fetchAdminUsers, updateUserStatus } from "../../api/admin";

const users = ref<AuthUser[]>([]);
const message = ref("");

async function loadUsers() {
  users.value = await fetchAdminUsers();
}

onMounted(loadUsers);

async function toggleUser(user: AuthUser) {
  await updateUserStatus(user.id, user.status === "active" ? "disabled" : "active");
  await loadUsers();
  message.value = "用户状态已更新。";
}
</script>

<template>
  <div class="workspace-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">用户管理</p>
        <h2>查看账号并控制可用状态</h2>
      </div>
      <p class="muted">{{ message }}</p>
    </section>

    <section class="content-band">
      <article v-for="user in users" :key="user.id" class="list-row">
        <div>
          <strong>{{ user.name }}</strong>
          <p>{{ user.username }} · {{ user.role }} · {{ user.status }}</p>
        </div>
        <button class="secondary-button" type="button" @click="toggleUser(user)">
          {{ user.status === "active" ? "禁用" : "启用" }}
        </button>
      </article>
    </section>
  </div>
</template>

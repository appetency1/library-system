<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const errorMessage = ref("");
const loading = ref(false);

const form = reactive({
  username: "student1",
  password: "Password123!"
});

async function submit() {
  errorMessage.value = "";
  loading.value = true;
  try {
    const session = await auth.login(form);
    router.push(session.user.role === "admin" ? "/admin/dashboard" : "/app/dashboard");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "登录失败，请检查账号和密码。";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-shell">
    <form class="auth-panel" @submit.prevent="submit">
      <p class="eyebrow">学生登录</p>
      <h1>进入座位预约系统</h1>

      <label>
        <span>账号</span>
        <input v-model="form.username" autocomplete="username" />
      </label>

      <label>
        <span>密码</span>
        <input v-model="form.password" type="password" autocomplete="current-password" />
      </label>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <button class="primary-button" type="submit" :disabled="loading">
        {{ loading ? "登录中..." : "登录" }}
      </button>

      <RouterLink class="ghost-link" to="/register">没有账号，去注册</RouterLink>
    </form>
  </div>
</template>

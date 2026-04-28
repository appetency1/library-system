<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const errorMessage = ref("");
const loading = ref(false);

const form = reactive({
  username: "",
  name: "",
  password: ""
});

async function submit() {
  errorMessage.value = "";
  loading.value = true;
  try {
    await auth.register(form);
    router.push("/app/dashboard");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "注册失败，请检查输入。";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-shell">
    <form class="auth-panel" @submit.prevent="submit">
      <p class="eyebrow">学生注册</p>
      <h1>创建预约账号</h1>

      <label>
        <span>账号</span>
        <input v-model="form.username" autocomplete="username" />
      </label>

      <label>
        <span>姓名</span>
        <input v-model="form.name" autocomplete="name" />
      </label>

      <label>
        <span>密码</span>
        <input v-model="form.password" type="password" autocomplete="new-password" />
      </label>

      <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

      <button class="primary-button" type="submit" :disabled="loading">
        {{ loading ? "注册中..." : "注册并进入" }}
      </button>

      <RouterLink class="ghost-link" to="/login">已有账号，去登录</RouterLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { getApiErrorMessage } from "../api/error";
import { useAuthStore } from "../stores/auth";
import AnimatedRegisterPanel from "../components/AnimatedRegisterPanel.vue";

const auth = useAuthStore();
const router = useRouter();
const errorMessage = ref("");
const loading = ref(false);

const showPassword = ref(false);
const username = ref("");
const name = ref("");
const password = ref("");
const confirmPassword = ref("");
const isTyping = ref(false);

async function submit() {
  errorMessage.value = "";
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "两次输入的密码不一致。";
    return;
  }
  
  if (password.value.length < 6) {
    errorMessage.value = "密码长度至少为6位。";
    return;
  }
  
  loading.value = true;
  try {
    await auth.register({
      username: username.value,
      name: name.value,
      password: password.value
    });
    router.push("/app/dashboard");
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, "注册失败，请检查输入。");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Global Star Background -->
    <div class="star-bg"></div>
    
    <AnimatedRegisterPanel
      :show-password="showPassword"
      :password="password"
      :confirm-password="confirmPassword"
      :username="username"
      :name="name"
      :is-typing="isTyping"
      @update:show-password="showPassword = $event"
      @update:password="password = $event"
      @update:confirm-password="confirmPassword = $event"
      @update:username="username = $event"
      @update:name="name = $event"
      @update:is-typing="isTyping = $event"
      @submit="submit"
    />
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
}

/* Global Star Background */
.star-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(108, 63, 245, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    #0a0f1a;
  pointer-events: none;
}

.star-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, white, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, white, transparent),
    radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
    radial-gradient(1px 1px at 230px 80px, white, transparent),
    radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 350px 200px, white, transparent),
    radial-gradient(2px 2px at 420px 50px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 500px 180px, white, transparent),
    radial-gradient(2px 2px at 580px 90px, rgba(255,255,255,0.9), transparent);
  background-repeat: repeat;
  background-size: 600px 250px;
}
</style>

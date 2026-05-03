<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import EyeBall from './EyeBall.vue';
import Pupil from './Pupil.vue';

const props = defineProps<{
  showPassword: boolean;
  password: string;
  username: string;
  isTyping: boolean;
}>();

const emit = defineEmits<{
  'update:showPassword': [value: boolean];
  'update:password': [value: string];
  'update:username': [value: string];
  'update:isTyping': [value: boolean];
  'submit': [];
}>();

const showPasswordLocal = computed({
  get: () => props.showPassword,
  set: (val) => emit('update:showPassword', val)
});

const usernameLocal = computed({
  get: () => props.username,
  set: (val) => emit('update:username', val)
});

const passwordLocal = computed({
  get: () => props.password,
  set: (val) => emit('update:password', val)
});

const mouseX = ref(0);
const mouseY = ref(0);

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
};

const isPurpleBlinking = ref(false);
const isBlackBlinking = ref(false);

const purpleRef = ref<HTMLDivElement | null>(null);
const blackRef = ref<HTMLDivElement | null>(null);
const yellowRef = ref<HTMLDivElement | null>(null);
const orangeRef = ref<HTMLDivElement | null>(null);

let purpleBlinkTimeout: number | null = null;
let blackBlinkTimeout: number | null = null;

const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

const schedulePurpleBlink = () => {
  purpleBlinkTimeout = window.setTimeout(() => {
    isPurpleBlinking.value = true;
    setTimeout(() => {
      isPurpleBlinking.value = false;
      schedulePurpleBlink();
    }, 150);
  }, getRandomBlinkInterval());
};

const scheduleBlackBlink = () => {
  blackBlinkTimeout = window.setTimeout(() => {
    isBlackBlinking.value = true;
    setTimeout(() => {
      isBlackBlinking.value = false;
      scheduleBlackBlink();
    }, 150);
  }, getRandomBlinkInterval());
};

const calculatePosition = (el: HTMLElement | null) => {
  if (!el) return { faceX: 0, faceY: 0, bodySkew: 0 };
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 3;
  const deltaX = mouseX.value - centerX;
  const deltaY = mouseY.value - centerY;
  const faceX = Math.max(-15, Math.min(15, deltaX / 20));
  const faceY = Math.max(-10, Math.min(10, deltaY / 30));
  const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
  return { faceX, faceY, bodySkew };
};

const purplePos = computed(() => calculatePosition(purpleRef.value));
const blackPos = computed(() => calculatePosition(blackRef.value));
const yellowPos = computed(() => calculatePosition(yellowRef.value));
const orangePos = computed(() => calculatePosition(orangeRef.value));

const purpleHeight = computed(() => (props.isTyping || (props.password.length > 0 && !props.showPassword)) ? '380px' : '340px');

const purpleTransform = computed(() => {
  if (props.password.length > 0 && props.showPassword) return 'skewX(0deg)';
  if (props.isTyping || (props.password.length > 0 && !props.showPassword)) return `skewX(${(purplePos.value.bodySkew || 0) - 12}deg) translateX(25px)`;
  return `skewX(${purplePos.value.bodySkew || 0}deg)`;
});

const blackTransform = computed(() => {
  if (props.password.length > 0 && props.showPassword) return 'skewX(0deg)';
  if (props.isTyping || (props.password.length > 0 && !props.showPassword)) return `skewX(${(blackPos.value.bodySkew || 0) * 1.5}deg)`;
  return `skewX(${blackPos.value.bodySkew || 0}deg)`;
});

const orangeTransform = computed(() => (props.password.length > 0 && props.showPassword) ? 'skewX(0deg)' : `skewX(${orangePos.value.bodySkew || 0}deg)`);
const yellowTransform = computed(() => (props.password.length > 0 && props.showPassword) ? 'skewX(0deg)' : `skewX(${yellowPos.value.bodySkew || 0}deg)`);

const purpleEyesLeft = computed(() => `${42 + purplePos.value.faceX}px`);
const purpleEyesTop = computed(() => `${36 + purplePos.value.faceY}px`);
const blackEyesLeft = computed(() => `${24 + blackPos.value.faceX}px`);
const blackEyesTop = computed(() => `${30 + blackPos.value.faceY}px`);
const orangePupilsLeft = computed(() => `${75 + (orangePos.value.faceX || 0)}px`);
const orangePupilsTop = computed(() => `${78 + (orangePos.value.faceY || 0)}px`);
const yellowPupilsLeft = computed(() => `${48 + (yellowPos.value.faceX || 0)}px`);
const yellowPupilsTop = computed(() => `${36 + (yellowPos.value.faceY || 0)}px`);
const yellowMouthLeft = computed(() => `${36 + (yellowPos.value.faceX || 0)}px`);
const yellowMouthTop = computed(() => `${78 + (yellowPos.value.faceY || 0)}px`);

const handleSubmit = () => emit('submit');

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  schedulePurpleBlink();
  scheduleBlackBlink();
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  if (purpleBlinkTimeout) clearTimeout(purpleBlinkTimeout);
  if (blackBlinkTimeout) clearTimeout(blackBlinkTimeout);
});
</script>

<template>
  <div class="auth-card">
    <!-- Left Panel - Characters -->
    <div class="panel-left">
      <!-- Header -->
      <div class="panel-header">
        <div class="header-logo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        </div>
        <span>智能图书馆</span>
      </div>

      <!-- Characters -->
      <div class="characters-container">
        <!-- Purple Character -->
        <div ref="purpleRef" class="char-purple" :style="{ height: purpleHeight, transform: purpleTransform }">
          <div class="char-eyes" :style="{ left: purpleEyesLeft, top: purpleEyesTop }">
            <EyeBall :size="18" :pupil-size="7" :max-distance="5" eye-color="white" pupil-color="#2D2D2D" :is-blinking="isPurpleBlinking" />
            <EyeBall :size="18" :pupil-size="7" :max-distance="5" eye-color="white" pupil-color="#2D2D2D" :is-blinking="isPurpleBlinking" />
          </div>
        </div>

        <!-- Black Character -->
        <div ref="blackRef" class="char-black" :style="{ transform: blackTransform }">
          <div class="char-eyes" :style="{ left: blackEyesLeft, top: blackEyesTop }">
            <EyeBall :size="16" :pupil-size="6" :max-distance="4" eye-color="white" pupil-color="#2D2D2D" :is-blinking="isBlackBlinking" />
            <EyeBall :size="16" :pupil-size="6" :max-distance="4" eye-color="white" pupil-color="#2D2D2D" :is-blinking="isBlackBlinking" />
          </div>
        </div>

        <!-- Orange Character -->
        <div ref="orangeRef" class="char-orange" :style="{ transform: orangeTransform }">
          <div class="char-pupils" :style="{ left: orangePupilsLeft, top: orangePupilsTop }">
            <Pupil :size="12" :max-distance="5" pupil-color="#2D2D2D" />
            <Pupil :size="12" :max-distance="5" pupil-color="#2D2D2D" />
          </div>
        </div>

        <!-- Yellow Character -->
        <div ref="yellowRef" class="char-yellow" :style="{ transform: yellowTransform }">
          <div class="char-pupils" :style="{ left: yellowPupilsLeft, top: yellowPupilsTop }">
            <Pupil :size="12" :max-distance="5" pupil-color="#2D2D2D" />
            <Pupil :size="12" :max-distance="5" pupil-color="#2D2D2D" />
          </div>
          <div class="char-mouth" :style="{ left: yellowMouthLeft, top: yellowMouthTop }"></div>
        </div>
      </div>

      <!-- Footer -->
      <div class="panel-footer">
        <a href="#">隐私政策</a>
        <a href="#">服务条款</a>
        <a href="#">联系我们</a>
      </div>
    </div>

    <!-- Right Panel - Form -->
    <div class="panel-right">
      <div class="form-wrapper">
        <div class="form-header">
          <h1>欢迎回来</h1>
          <p>请输入您的账号信息</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="field-group">
            <label for="username">Username</label>
            <input id="username" v-model="usernameLocal" type="text" placeholder="Enter your username" autocomplete="off" @focus="emit('update:isTyping', true)" @blur="emit('update:isTyping', false)" required />
          </div>

          <div class="field-group">
            <label for="password">Password</label>
            <div class="password-field">
              <input id="password" v-model="passwordLocal" :type="showPasswordLocal ? 'text' : 'password'" placeholder="••••••••" required />
              <button type="button" @click="showPasswordLocal = !showPasswordLocal" class="eye-btn">
                <svg v-if="!showPasswordLocal" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
              </button>
            </div>
          </div>

          <div class="form-row">
            <label class="check-label">
              <input type="checkbox" />
              <span>Remember for 30 days</span>
            </label>
            <a href="#" class="link-forgot">Forgot password?</a>
          </div>

          <button type="submit" class="submit-btn">Log in</button>

          <div class="divider-row">
            <span>or</span>
          </div>

          <button type="button" class="social-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Log in with Google
          </button>
        </form>

        <div class="form-footer">
          Don't have an account? <RouterLink to="/register">Sign Up</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== AUTH CARD ========== */
.auth-card {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 900px;
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
  background: #0a0e17;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* ========== LEFT PANEL ========== */
.panel-left {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #6c38ff 0%, #7c4fff 50%, #6c38ff 100%);
  padding: 2rem 2.5rem;
  color: white;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  z-index: 10;
}

.header-logo {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
}

.header-logo svg {
  width: 16px;
  height: 16px;
}

/* Characters Container */
.characters-container {
  position: relative;
  width: 100%;
  height: calc(100% - 60px);
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.char-purple {
  position: absolute;
  bottom: 0;
  left: 45px;
  width: 160px;
  background: #6C3FF5;
  border-radius: 10px 10px 0 0;
  z-index: 1;
  transform-origin: bottom center;
}

.char-black {
  position: absolute;
  bottom: 0;
  left: 185px;
  width: 105px;
  height: 270px;
  background: #2D2D2D;
  border-radius: 8px 8px 0 0;
  z-index: 2;
  transform-origin: bottom center;
}

.char-orange {
  position: absolute;
  bottom: 0;
  left: -15px;
  width: 210px;
  height: 160px;
  background: #FF9B6B;
  border-radius: 105px 105px 0 0;
  z-index: 3;
  transform-origin: bottom center;
}

.char-yellow {
  position: absolute;
  bottom: 0;
  left: 255px;
  width: 115px;
  height: 185px;
  background: #E8D754;
  border-radius: 57px 57px 0 0;
  z-index: 4;
  transform-origin: bottom center;
}

.char-eyes {
  display: flex;
  gap: 2rem;
  position: absolute;
}

.char-pupils {
  display: flex;
  gap: 2rem;
  position: absolute;
}

.char-mouth {
  position: absolute;
  width: 4.5rem;
  height: 4px;
  background: #2D2D2D;
  border-radius: 9999px;
}

.panel-footer {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.6);
  z-index: 10;
}

.panel-footer a:hover {
  color: white;
}

/* ========== RIGHT PANEL ========== */
.panel-right {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1.5rem 2rem;
  background: #0a0e17;
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
  flex-shrink: 0;
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.form-header p {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
}

.field-group input {
  height: 3rem;
  padding: 0 1rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #1a1f2e !important;
  color: #ffffff !important;
  font-size: 0.95rem;
  backdrop-filter: none !important;
}

.field-group input::placeholder {
  color: #64748b;
}

.field-group input:focus {
  outline: none;
  border-color: #6c38ff;
  box-shadow: 0 0 0 3px rgba(108, 56, 255, 0.2);
}

.password-field {
  position: relative;
}

.password-field input {
  width: 100%;
  padding-right: 3rem;
}

.eye-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #64748b;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-btn:hover {
  color: #6c38ff;
}

.eye-btn:focus {
  outline: none;
}

/* Form Row */
.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1;
}

.check-label input {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #6c38ff;
  cursor: pointer;
  background: #1a1f2e !important;
  border: none !important;
  backdrop-filter: none !important;
}

.check-label span {
  line-height: 1.125rem;
  margin-top: 9px;
}

.link-forgot {
  font-size: 0.875rem;
  color: #6c38ff;
  font-weight: 500;
}

.link-forgot:hover {
  text-decoration: underline;
}

/* Submit Button */
.submit-btn {
  height: 3rem;
  background: #6c38ff;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(108, 56, 255, 0.3);
  letter-spacing: 0.02em;
  margin-top: 0.25rem;
}

.submit-btn:hover {
  background: #5a2fd4;
}

/* Divider */
.divider-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.25rem 0;
}

.divider-row::before,
.divider-row::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #334155;
}

.divider-row span {
  font-size: 0.875rem;
  color: #64748b;
}

/* Social Button */
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 3rem;
  padding: 0 1rem;
  background: #1a1f2e;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
}

.social-btn:hover {
  background: #252a3d;
}

/* Form Footer */
.form-footer {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: #64748b;
}

.form-footer a {
  color: #6c38ff;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 950px) {
  .auth-card {
    grid-template-columns: 1fr;
    width: 95%;
    height: auto;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .panel-left {
    height: 250px;
  }
  
  .characters-container {
    height: 150px;
  }
  
  .char-purple {
    left: 20px;
    width: 60px;
  }
  
  .char-black {
    left: 75px;
    width: 40px;
    height: 100px;
  }
  
  .char-orange {
    width: 80px;
    height: 70px;
  }
  
  .char-yellow {
    left: 105px;
    width: 45px;
    height: 75px;
  }
  
  .panel-right {
    padding: 2rem;
  }
}
</style>

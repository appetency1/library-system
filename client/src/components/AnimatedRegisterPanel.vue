<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import EyeBall from './EyeBall.vue';
import Pupil from './Pupil.vue';
import AssistedPasswordConfirm from './AssistedPasswordConfirm.vue';

const props = defineProps<{
  showPassword: boolean;
  password: string;
  confirmPassword: string;
  username: string;
  name: string;
  isTyping: boolean;
}>();

const emit = defineEmits<{
  'update:showPassword': [value: boolean];
  'update:password': [value: string];
  'update:confirmPassword': [value: string];
  'update:username': [value: string];
  'update:name': [value: string];
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

const nameLocal = computed({
  get: () => props.name,
  set: (val) => emit('update:name', val)
});

const passwordLocal = computed({
  get: () => props.password,
  set: (val) => emit('update:password', val)
});

const confirmPasswordLocal = computed({
  get: () => props.confirmPassword,
  set: (val) => emit('update:confirmPassword', val)
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
          <h1>Create an account</h1>
          <p>Join us today</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="field-group">
            <label for="username">Username</label>
            <input id="username" v-model="usernameLocal" type="text" placeholder="Choose a username" autocomplete="username" required />
          </div>

          <div class="field-group">
            <label for="name">Full Name</label>
            <input id="name" v-model="nameLocal" type="text" placeholder="Enter your full name" autocomplete="name" required />
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

          <AssistedPasswordConfirm :password="passwordLocal" @update:confirmPassword="(val: string) => confirmPasswordLocal = val" />

          <button type="submit" class="submit-btn">Create account</button>
        </form>

        <div class="form-footer">
          Already have an account? <RouterLink to="/login">Log in</RouterLink>
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
  margin-bottom: 1.25rem;
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
  gap: 0.875rem;
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

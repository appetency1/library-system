<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps<{
  password: string;
}>();

const emit = defineEmits<{
  'update:confirmPassword': [value: string];
}>();

const confirmPassword = ref('');
const isShaking = ref(false);
const isScaling = ref(false);
const containerRef = ref<HTMLDivElement | null>(null);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Backspace') {
    confirmPassword.value = confirmPassword.value.slice(0, -1);
    emit('update:confirmPassword', confirmPassword.value);
  } else if (e.key.length === 1 && props.password.length > 0) {
    if (confirmPassword.value.length >= props.password.length) {
      isShaking.value = true;
      setTimeout(() => {
        isShaking.value = false;
      }, 500);
      return;
    }
    confirmPassword.value += e.key;
    emit('update:confirmPassword', confirmPassword.value);
  }
};

const handleContainerClick = () => {
  containerRef.value?.focus();
};

const passwordsMatch = computed(() => 
  props.password.length > 0 &&
  confirmPassword.value === props.password
);

watch(passwordsMatch, (match) => {
  if (match) {
    isScaling.value = true;
    setTimeout(() => {
      isScaling.value = false;
    }, 300);
  }
});

watch(() => props.password, () => {
  confirmPassword.value = '';
  containerRef.value?.focus();
});

onMounted(() => {
  containerRef.value?.focus();
});
</script>

<template>
  <div class="confirm-container">
    <label class="confirm-label">Confirm Password</label>
    
    <div 
      ref="containerRef"
      class="confirm-wrapper"
      :class="{ 
        'shake': isShaking, 
        'scale': isScaling,
        'match': passwordsMatch,
        'error': confirmPassword.length === password.length && password.length > 0 && !passwordsMatch
      }"
      tabindex="0"
      @click="handleContainerClick"
      @keydown="handleKeydown"
    >
      <!-- Dot indicators -->
      <div class="dots-row">
        <span 
          v-for="(_, index) in password" 
          :key="index"
          class="dot"
          :class="{
            'filled': index < confirmPassword.length,
            'correct': index < confirmPassword.length && confirmPassword[index] === password[index],
            'wrong': index < confirmPassword.length && confirmPassword[index] !== password[index]
          }"
        ></span>
      </div>
      
      <!-- Placeholder text -->
      <span class="placeholder-text" v-if="confirmPassword.length === 0">
        Click to enter password
      </span>
    </div>
  </div>
</template>

<style scoped>
.confirm-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.confirm-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text, #334155);
}

@media (prefers-color-scheme: dark) {
  .confirm-label {
    color: var(--text, #e2e8f0);
  }
}

.confirm-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 1rem;
  background: var(--bg-secondary, #ffffff);
  border: 2px solid var(--glass-border, #e2e8f0);
  border-radius: 0.625rem;
  transition: all 0.3s ease;
  cursor: text;
  outline: none;
}

@media (prefers-color-scheme: dark) {
  .confirm-wrapper {
    background: var(--bg-secondary, #1e293b);
    border-color: var(--glass-border, #334155);
  }
}

.confirm-wrapper:focus {
  border-color: var(--accent, #8400FF);
  box-shadow: 0 0 0 3px var(--accent-soft, rgba(132, 0, 255, 0.15));
}

.confirm-wrapper.match {
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.confirm-wrapper.error {
  border-color: #ef4444;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.confirm-wrapper.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.confirm-wrapper.scale {
  animation: scale 0.3s ease;
}

.dots-row {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted, #cbd5e1);
  transition: all 0.2s ease;
}

.dot.filled {
  background: var(--accent, #8400FF);
}

.dot.correct {
  background: #10B981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.dot.wrong {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
}

.placeholder-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  color: var(--text-muted, #94a3b8);
  pointer-events: none;
  transition: opacity 0.2s;
}
</style>

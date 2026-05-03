<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  hint?: string;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}>();
</script>

<template>
  <article class="stat-card" :class="[`stat-card-${variant || 'default'}`]">
    <div class="stat-card-inner">
      <div v-if="icon" class="stat-icon" v-html="icon"></div>
      <div class="stat-content">
        <p class="eyebrow">{{ label }}</p>
        <h3 class="stat-value">{{ value }}</h3>
        <p v-if="hint" class="stat-hint">{{ hint }}</p>
      </div>
      <div class="stat-glow"></div>
    </div>
  </article>
</template>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--glass-border-hover);
  transform: translateY(-4px);
  box-shadow: var(--glass-shadow-hover);
}

.stat-card-inner {
  position: relative;
  padding: 1.5rem;
  z-index: 1;
}

.stat-glow {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 80%;
  height: 150%;
  background: radial-gradient(circle, var(--accent-glow), transparent 60%);
  opacity: 0.1;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-glow {
  opacity: 0.2;
}

.stat-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent);
}

.stat-card-success .stat-icon {
  background: var(--success-soft);
  color: var(--success);
}

.stat-card-warning .stat-icon {
  background: var(--warning-soft);
  color: var(--warning);
}

.stat-card-info .stat-icon {
  background: var(--info-soft);
  color: var(--info);
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-value {
  margin: 0.25rem 0 0.15rem;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #fff, var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-card-success .stat-value {
  background: linear-gradient(135deg, #fff, var(--success));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card-warning .stat-value {
  background: linear-gradient(135deg, #fff, var(--warning));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card-info .stat-value {
  background: linear-gradient(135deg, #fff, var(--info));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.88rem;
}
</style>

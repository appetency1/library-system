<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  hint?: string;
}>();
</script>

<template>
  <article class="info-panel stat-card">
    <p class="eyebrow">{{ label }}</p>
    <h3>{{ value }}</h3>
    <p>{{ hint }}</p>
  </article>
</template>

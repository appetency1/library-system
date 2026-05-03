<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = withDefaults(defineProps<{
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}>(), {
  size: 12,
  maxDistance: 5,
  pupilColor: 'black'
});

const pupilRef = ref<HTMLDivElement | null>(null);
const mouseX = ref(0);
const mouseY = ref(0);

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});

const pupilPosition = computed(() => {
  if (props.forceLookX !== undefined && props.forceLookY !== undefined) {
    return { x: props.forceLookX, y: props.forceLookY };
  }

  if (!pupilRef.value) return { x: 0, y: 0 };

  const pupil = pupilRef.value.getBoundingClientRect();
  const pupilCenterX = pupil.left + pupil.width / 2;
  const pupilCenterY = pupil.top + pupil.height / 2;

  const deltaX = mouseX.value - pupilCenterX;
  const deltaY = mouseY.value - pupilCenterY;
  const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), props.maxDistance);

  const angle = Math.atan2(deltaY, deltaX);
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return { x, y };
});
</script>

<template>
  <div
    ref="pupilRef"
    class="rounded-full"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: pupilColor,
      transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
      transition: 'transform 0.1s ease-out'
    }"
  />
</template>

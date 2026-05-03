import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useCardGlow() {
  const glowElements = ref<HTMLElement[]>([]);
  const mouseX = ref(0);
  const mouseY = ref(0);

  const registerElement = (el: HTMLElement) => {
    if (el && !glowElements.value.includes(el)) {
      glowElements.value.push(el);
    }
  };

  const unregisterElement = (el: HTMLElement) => {
    const index = glowElements.value.indexOf(el);
    if (index > -1) {
      glowElements.value.splice(index, 1);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    mouseX.value = e.clientX;
    mouseY.value = e.clientY;

    glowElements.value.forEach(card => {
      const rect = card.getBoundingClientRect();
      const relativeX = ((mouseX.value - rect.left) / rect.width) * 100;
      const relativeY = ((mouseY.value - rect.top) / rect.height) * 100;

      let glowIntensity = 0;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(mouseX.value - centerX, mouseY.value - centerY);
      const maxDistance = Math.max(rect.width, rect.height);

      if (distance < maxDistance) {
        glowIntensity = 1 - (distance / maxDistance);
      }

      card.style.setProperty('--glow-x', `${relativeX}%`);
      card.style.setProperty('--glow-y', `${relativeY}%`);
      card.style.setProperty('--glow-intensity', glowIntensity.toString());
    });
  };

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleMouseMove);
  });

  return {
    registerElement,
    unregisterElement,
    mouseX,
    mouseY
  };
}

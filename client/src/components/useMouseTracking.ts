import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useMousePosition() {
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

  return { mouseX, mouseY };
}

export function useRandomBlink() {
  const isBlinking = ref(false);
  let timeoutId: number | null = null;

  const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

  const scheduleBlink = () => {
    timeoutId = window.setTimeout(() => {
      isBlinking.value = true;
      setTimeout(() => {
        isBlinking.value = false;
        scheduleBlink();
      }, 150);
    }, getRandomBlinkInterval());
  };

  onMounted(() => {
    scheduleBlink();
  });

  onBeforeUnmount(() => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  });

  return { isBlinking };
}

export interface CharacterPosition {
  faceX: number;
  faceY: number;
  bodySkew: number;
}

export function useCharacterPosition(elementRef: { value: HTMLElement | null }, mouseX: { value: number }, mouseY: { value: number }) {
  const calculatePosition = (): CharacterPosition => {
    const el = elementRef.value;
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

  return { calculatePosition };
}

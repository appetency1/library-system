import { ref, watch, onMounted } from 'vue';

const isDark = ref(true);

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    updateTheme();
  };

  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  };

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDark.value = savedTheme === 'dark';
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    updateTheme();
  });

  watch(isDark, () => {
    updateTheme();
  });

  return {
    isDark,
    toggleTheme
  };
}

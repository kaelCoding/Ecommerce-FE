<script setup>
import { useTheme } from '@/composables/useTheme';

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <button @click="toggleTheme" class="theme-toggle"
    :aria-label="'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' mode'">
    <transition name="fade" mode="out-in">
      <i v-if="theme === 'light'" class="fas fa-moon"></i>
      <i v-else class="fas fa-sun"></i>
    </transition>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  line-height: 1;
  transition: color var(--transition-speed) ease;
}

.theme-toggle:hover {
  color: var(--primary-color);
}

.fa-sun,
.fa-moon {
  font-size: clamp(1.1rem, 3vw, 1.5rem); 
}

@media (max-width: 768px) {
  .fa-moon,
  .fa-sun {
    font-size: clamp(1.2rem, 4vw, 1.5rem);
    color: var(--secondary-color);
  }
}
</style>
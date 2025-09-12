<script setup>
defineEmits(['toggle-chat']);
</script>

<template>
  <button class="chat-bubble" @click="$emit('toggle-chat')" aria-label="Mở cửa sổ chat">
    <i class="fa-solid fa-comments"></i>
  </button>
</template>

<style scoped>
.chat-bubble {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 3.75rem;
  height: 3.75rem;
  background-color: var(--primary-color);
  color: var(--white-color);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.2);
  z-index: 5;
  transition: all var(--transition-speed) ease;
}

.chat-bubble:hover {
  transform: scale(1.1);
  background-color: var(--secondary-color);
}

@media (max-width: 768px) {
  .chat-bubble {
    width: 3.25rem; 
    height: 3.25rem; 
    font-size: 1.25rem; 
    bottom: 1rem; 
    right: 1rem; 
  }
}
</style>
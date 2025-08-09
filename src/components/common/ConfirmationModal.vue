<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Xác nhận hành động',
  },
  message: {
    type: String,
    default: 'Bạn có chắc chắn muốn thực hiện hành động này?',
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const onConfirm = () => {
  emit('confirm');
};

const onCancel = () => {
  emit('cancel');
};
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="onCancel">
        <div class="checkout-modal">
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="onCancel">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <p>{{ message }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn" @click="onCancel">Hủy</button>
            <button class="btn btn-danger" @click="onConfirm">Xác nhận</button> </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-footer {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-danger {
  background-color: #F44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

html[data-theme="dark"] .modal-backdrop {
  background-color: rgba(0, 0, 0, 0.75); 
}
</style>
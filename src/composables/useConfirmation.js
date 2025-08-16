import { ref } from 'vue';

export function useConfirmation(deleteAction) {
    const isConfirmModalVisible = ref(false);
    const itemToDeleteId = ref(null);
    const isDeleting = ref(false);

    const showConfirmModal = (id) => {
        itemToDeleteId.value = id;
        isConfirmModalVisible.value = true;
    };

    const cancelDelete = () => {
        isConfirmModalVisible.value = false;
        itemToDeleteId.value = null;
    };

    const confirmDelete = async () => {
        if (!itemToDeleteId.value) return;
        isDeleting.value = true;
        try {
            await deleteAction(itemToDeleteId.value);
        } finally {
            isDeleting.value = false;
            cancelDelete();
        }
    };

    return {
        isConfirmModalVisible,
        isDeleting,
        showConfirmModal,
        cancelDelete,
        confirmDelete,
    };
}
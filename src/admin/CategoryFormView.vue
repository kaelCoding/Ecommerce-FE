<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { add_category_api, update_category_api, get_categoryID_api } from '@/services/category';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useNotification } from '@/composables/useNotification';

const { showNotification } = useNotification();

const route = useRoute();
const router = useRouter();
const isLoading = ref(false);

const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới');
const submitButtonText = computed(() => isEditing.value ? 'Cập Nhật' : 'Thêm Danh Mục');

const category = ref({
    name: "",
});

onMounted(async () => {
    if (isEditing.value) {
        try {
            isLoading.value = true;
            const fetchedCategory = await get_categoryID_api(route.params.id);
            category.value.name = fetchedCategory.name;
        } catch (err) {
            console.error("Failed to fetch category data:", err);
            showNotification("Không tìm thấy danh mục.", "error");
        } finally {
            isLoading.value = false;
        }
    }
});

const handleSubmit = async () => {
    isLoading.value = true;

    try {
        if (isEditing.value) {
            await update_category_api(route.params.id, category.value);
            showNotification("Cập nhật danh mục thành công!")
        } else {
            await add_category_api(category.value);
            showNotification("Thêm danh mục thành công!")
        }
        router.push({ name: 'admin-categories' });
    } catch (err) {
        console.error('Submit failed:', err);
        showNotification("Đã có lỗi xảy ra.", "error")
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div>
        <div class="main-header">
            <h1>{{ pageTitle }}</h1>
        </div>
        <div class="content-area">
            <LoadingSpinner v-if="isLoading" message="Đang tải..."/>
            <form v-else @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="name">Tên danh mục</label>
                    <input v-model="category.name" type="text" id="name" class="form-input" required>
                </div>

                <div class="form-action-buttons">
                    <button type="button" class="btn" @click="router.back()"
                        style="background-color: #6B7280; color: white;">Hủy</button>
                    <button type="submit" class="btn-primary" :disabled="isLoading">
                        {{ isLoading ? 'Đang xử lý...' : submitButtonText }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.main-header {
    background-color: var(--white-color);
    padding: 20px 30px;
    margin-bottom: 30px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
}

.main-header h1 {
    font-size: 1.8rem;
    font-weight: 600;
}

.content-area {
    background-color: var(--white-color);
    padding: 30px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    max-width: 600px;
}

.form-action-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
}

@media (max-width: 992px) {
    .main-header {
        padding: 15px 20px;
        margin-bottom: 20px;
    }

    .main-header h1 {
        font-size: 1.5rem;
    }

    .content-area {
        padding: 20px;
        max-width: 100%;
    }

    .form-group label {
        font-size: 0.95rem;
    }

    .form-input {
        font-size: 0.9rem;
    }
}

@media (max-width: 768px) {
    .main-header h1 {
        font-size: 1.2rem;
    }

    .content-area {
        padding: 15px;
    }

    .form-group label {
        font-size: 0.9rem;
    }

    .form-input {
        font-size: 0.85rem;
        padding: 10px;
    }

    .form-action-buttons {
        flex-direction: column;
        gap: 10px;
    }
}
</style>
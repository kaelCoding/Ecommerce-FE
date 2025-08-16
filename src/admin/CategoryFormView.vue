<script setup>
import { reactive, onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { add_category_api, update_category_api } from '@/services/category';
import { useNotification } from '@/composables/useNotification';
import { useAdminStore } from '@/stores/admin';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const { showNotification } = useNotification();
const adminStore = useAdminStore();
const isLoading = ref(false);

const route = useRoute();
const router = useRouter();
 
const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới');
const submitButtonText = computed(() => isEditing.value ? 'Cập Nhật' : 'Thêm Danh Mục');

const category = reactive({
    id: null,
    name: "",
});

onMounted(async () => {
    if (isEditing.value) {
        isLoading.value = true;
        try {
            const categoryId = Number(route.params.id);
            const fetchedCategory = await adminStore.fetchCategoryById(categoryId);
            
            category.id = fetchedCategory.ID;
            category.name = fetchedCategory.name;
        } catch (err) {
            console.error("Failed to fetch category data:", err);
            showNotification(err.message || err, "error");
            router.push({ name: 'admin-categories' });
        } finally {
            isLoading.value = false;
        }
    }
});

const handleSubmit = async () => {
    isLoading.value = true;
    try {
        if (isEditing.value) {
            const payload = { name: category.name };
            const updatedCategory = await update_category_api(category.id, payload);
            adminStore.updateCategory(updatedCategory);
            showNotification("Cập nhật danh mục thành công!");
        } else {
            const newCategory = await add_category_api({ name: category.name });
            adminStore.addCategory(newCategory);
            showNotification("Thêm danh mục thành công!");
        }
        router.push({ name: 'admin-categories' });
    } catch (err) {
        console.error('Submit failed:', err);
        showNotification(err.message || err, "error");
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
                    <input v-model="category.name" type="text" id="name" class="form-input" placeholder="Nhập danh mục" required>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn" @click="router.back()">Hủy</button>
                    <button type="submit" class="btn-primary" :disabled="isLoading">
                        {{ isLoading ? 'Đang xử lý...' : submitButtonText }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
</style>
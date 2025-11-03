<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { add_product_api, update_product_api } from '@/services/product';
import { useNotification } from '@/composables/useNotification';
import { useAdminStore } from '@/stores/admin';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const { showNotification } = useNotification();
const adminStore = useAdminStore();
const isLoading = ref(false);

const route = useRoute();
const router = useRouter();

const selectedFiles = ref([]);
const existingImageUrls = ref([]);

const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới');
const submitButtonText = computed(() => isEditing.value ? 'Cập Nhật' : 'Thêm Sản Phẩm');

const product = reactive({
    id: null,
    name: "",
    description: "",
    price: "",
    categoryIds: [], 
});

onMounted(async () => {
    await adminStore.fetchCategories();

    if (isEditing.value) {
        isLoading.value = true;
        try {
            const productId = Number(route.params.id);
            const fetchedProduct = await adminStore.fetchProductById(productId);

            product.id = fetchedProduct.ID;
            product.name = fetchedProduct.name;
            product.description = fetchedProduct.description;
            product.price = fetchedProduct.price;
            product.categoryIds = fetchedProduct.categories.map(cat => cat.ID);
            existingImageUrls.value = fetchedProduct.image_urls || [];
        } catch (err) {
            console.error("Failed to fetch product data:", err);
            showNotification(err, "error");
        } finally {
            isLoading.value = false;
        }
    }
});

const handleFileChange = (event) => {
    selectedFiles.value = Array.from(event.target.files);
};

const handleSubmit = async () => {
    if (!isEditing.value && selectedFiles.value.length === 0) {
        showNotification("Vui lòng chọn ít nhất một ảnh.", "error");
        return;
    }
    
    if (product.categoryIds.length === 0) {
        showNotification("Vui lòng chọn ít nhất một danh mục.", "error");
        return;
    }

    isLoading.value = true;
    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    
    for (const id of product.categoryIds) {
        formData.append('category_ids', id);
    }

    if (selectedFiles.value.length > 0) {
        for (const file of selectedFiles.value) {
            formData.append('images', file);
        }
    }

    try {
        if (isEditing.value) {
            const updatedProduct = await update_product_api(route.params.id, formData);
            adminStore.updateProduct(updatedProduct); 
            showNotification("Cập nhật sản phẩm thành công!");
        } else {
            const newProduct = await add_product_api(formData);
            adminStore.addProduct(newProduct);
            showNotification("Thêm sản phẩm thành công!");
        }

        router.push({ name: 'admin-products' });
    } catch (err) {
        console.error('Submit failed:', err);
        showNotification(err, "error");
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
            <LoadingSpinner v-if="isLoading" message="Đang tải..." />
            <form v-else @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="name">Tên sản phẩm</label>
                    <input type="text" id="name" class="form-input" v-model="product.name"
                        placeholder="Nhập tên sản phẩm" required>
                </div>
                
                <div class="form-group">
                    <label for="category">Danh mục</label>
                    <div class="category-checkbox-group">
                        <label v-for="cat in adminStore.categories" :key="cat.ID" class="checkbox-label">
                            <input type="checkbox" :value="cat.ID" v-model="product.categoryIds" />
                            {{ cat.name }}
                        </label>
                    </div>
                    <div v-if="adminStore.categories.length === 0">
                        <small>Không tìm thấy danh mục nào. Vui lòng <RouterLink to="/admin/categories/new">tạo danh mục</RouterLink> trước.</small>
                    </div>
                </div>
                <div class="form-group">
                    <label for="price">Giá</label>
                    <input type="text" id="price" class="form-input" v-model="product.price" placeholder="Nhập giá"
                        required>
                </div>
                
                <div class="form-group">
                    <label for="imageUrl">Mô tả</label>
                    <textarea id="description" class="form-input" v-model="product.description"
                        placeholder="Nhập mô tả"></textarea>
                </div>

                <div v-if="isEditing && existingImageUrls.length > 0" class="form-group">
                    <label>Ảnh hiện tại</label>
                    <div class="existing-images">
                        <img v-for="url in existingImageUrls" :key="url" :src="url" class="table-img" />
                    </div>
                </div>

                <div class="form-group">
                    <label for="images">{{ isEditing ? 'Tải lên ảnh mới (sẽ thay thế ảnh cũ)' : 'Ảnh sản phẩm'
                    }}</label>
                    <input type="file" id="images" @change="handleFileChange" multiple accept="image/*" />
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
.existing-images {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.category-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--light-gray-color);
    padding: 15px;
    border-radius: var(--border-radius);
    background-color: var(--white-color);
}
.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}
.checkbox-label input[type="checkbox"] {
    width: 1.2em;
    height: 1.2em;
    accent-color: var(--primary-color);
}
</style>
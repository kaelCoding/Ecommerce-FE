<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { add_product_api, get_productID_api, update_product_api } from '@/services/product';
import { get_categories_api } from '@/services/category';
import { useNotification } from '@/composables/useNotification';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const { showNotification } = useNotification();

const route = useRoute()
const router = useRouter()

const isLoading = ref(false);
const categories = ref([])

const selectedFiles = ref([]);
const existingImageUrls = ref([]);

const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới');
const submitButtonText = computed(() => isEditing.value ? 'Cập Nhật' : 'Thêm Sản Phẩm');

onMounted(async () => {
    try {
        categories.value = await get_categories_api();
    } catch (err) {
        console.error("Failed to fetch categories:", err);
        showNotification("Không thể tải danh sách danh mục.", "error")
    }

    if (isEditing.value) {
        try {
            isLoading.value = true;
            const fetchedProduct = await get_productID_api(route.params.id);

            product.name = fetchedProduct.name;
            product.description = fetchedProduct.description;
            product.price = fetchedProduct.price;
            product.categoryId = fetchedProduct.category_id;
            product.category_name = fetchedProduct.category_name;

            existingImageUrls.value = fetchedProduct.image_urls || [];
        } catch (err) {
            console.error("Failed to fetch product data:", err);
            showNotification("Không tìm thấy sản phẩm.", "error")
        } finally {
            isLoading.value = false;
        }
    }
});

const product = reactive({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    category_name: "",
})

const handleFileChange = (event) => {
    selectedFiles.value = Array.from(event.target.files);
    console.log(selectedFiles.value)
};

const handleSubmit = async () => {
    if (!isEditing.value && selectedFiles.value.length === 0) {
        showNotification("Please select at least one image.", "error")
        return;
    }

    isLoading.value = true;

    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category_id', product.categoryId);

    if (selectedFiles.value.length > 0) {
        for (const file of selectedFiles.value) {
            formData.append('images', file);
        }
    }

    try {
        if (isEditing.value) {
            await update_product_api(route.params.id, formData);
            showNotification("Cập nhật sản phẩm thành công!")
        } else {
            await add_product_api(formData);
            showNotification("Thêm sản phẩm thành công!")
        }
        router.push({ name: 'admin-products' });
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
                    <label for="name">Tên sản phẩm</label>
                    <input type="text" id="name" class="form-input" v-model="product.name" placeholder="Nhập tên sản phẩm" required>
                </div>
                <div class="form-group">
                    <label for="category">Danh mục</label>
                    <select id="category" class="form-input" v-model="product.categoryId" required>
                        <option value="" disabled>Chọn danh mục</option>
                        <option v-for="cat in categories" :key="cat.ID" :value="cat.ID">{{ cat.name }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="price">Giá</label>
                    <input type="text" id="price" class="form-input" v-model="product.price" placeholder="Nhập giá" required>
                </div>
                <!-- <div class="form-group">
                <label for="stock">Kho hàng</label>
                <input type="number" id="stock" class="form-input" v-model.number="product.stock" required>
            </div> -->
                <div class="form-group">
                    <label for="imageUrl">Mô tả</label>
                    <textarea id="description" class="form-input" v-model="product.description" placeholder="Nhập mô tả"></textarea>
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
</style>
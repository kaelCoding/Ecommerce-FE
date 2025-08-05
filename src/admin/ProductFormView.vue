<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { add_product_api, get_productID_api, update_product_api } from '@/services/product';
import { get_category_api } from '@/services/category';

const route = useRoute()
const router = useRouter()

const isLoading = ref(false);
const error = ref(null);
const categories = ref([])

const selectedFiles = ref([]);
const existingImageUrls = ref([]);

const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới');
const submitButtonText = computed(() => isEditing.value ? 'Cập Nhật' : 'Thêm Sản Phẩm');

onMounted(async () => {
    try {
        categories.value = await get_category_api();
    } catch (err) {
        console.error("Failed to fetch categories:", err);
        error.value = "Không thể tải danh sách danh mục.";
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
            error.value = "Không tìm thấy sản phẩm.";
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
        error.value = "Please select at least one image.";
        return;
    }

    isLoading.value = true;
    error.value = null;

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
            console.log("update product oke")
        } else {
            await add_product_api(formData);
            console.log("add product oke")
        }
        router.push({ name: 'admin-products' });
    } catch (err) {
        console.error('Submit failed:', err);
        error.value = err.message || 'Đã có lỗi xảy ra.';
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
            <div v-if="isLoading" class="loading-indicator">Đang tải...</div>
            <form v-else @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="name">Tên sản phẩm</label>
                    <input type="text" id="name" class="form-input" v-model="product.name" required>
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
                    <input type="text" id="price" class="form-input" v-model="product.price" required>
                </div>
                <!-- <div class="form-group">
                <label for="stock">Kho hàng</label>
                <input type="number" id="stock" class="form-input" v-model.number="product.stock" required>
            </div> -->
                <div class="form-group">
                    <label for="imageUrl">Mô tả</label>
                    <textarea id="description" class="form-input" v-model="product.description"></textarea>
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

                <div v-if="error" class="error-message">{{ error }}</div>

                <div class="form-action-buttons">
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
}

.form-action-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
}

.btn {
    width: auto !important;
}

.error-message {
    color: red;
    margin-bottom: 1rem;
}

.loading-indicator {
    text-align: center;
    padding: 2rem;
}

.existing-images {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.table-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
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
  }
  
  .form-group label {
    font-size: 0.95rem;
  }
  
  .form-input, select.form-input, textarea.form-input {
    font-size: 0.9rem;
  }

  .table-img {
    width: 60px;
    height: 60px;
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

  .form-input, select.form-input, textarea.form-input {
    font-size: 0.85rem;
    padding: 10px;
  }
  
  .form-action-buttons {
    flex-direction: column;
    justify-content: center;
    gap: 10px;
  }
  
  .btn {
    width: 100% !important;
  }
  
  .table-img {
    width: 50px;
    height: 50px;
  }
}
</style>
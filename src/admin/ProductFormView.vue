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
    color: var(--text-color);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-color);
}

.form-input,
select.form-input,
textarea.form-input {
    width: 100%;
    padding: 12px 15px;
    font-size: 1rem;
    border: 1px solid #d1d5db;
    border-radius: var(--border-radius);
    background-color: var(--light-gray-color);
    color: var(--text-color);
    transition: all 0.3s ease;
}

.form-input:focus,
select.form-input:focus,
textarea.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    background-color: var(--white-color);
}

select.form-input {
    appearance: none;
    -webkit-appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>');
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1.5em;
    padding-right: 2.5rem;
}

textarea.form-input {
    min-height: 120px;
    resize: vertical;
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
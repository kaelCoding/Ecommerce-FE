<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useNotification } from '@/composables/useNotification';
import { useI18n } from 'vue-i18n';
import { get_categories_api } from '@/services/category'; // Bỏ get_products_by_category_api
import { get_products_api } from '@/services/product';
import ProductCard from '@/components/product/Card.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import { useRoute } from 'vue-router'; // <-- THÊM MỚI

const { t } = useI18n();
const { showNotification } = useNotification();
const route = useRoute(); // <-- THÊM MỚI

// --- STATE MỚI ---
const categories = ref([]);
const products = ref([]);
const allProducts = ref([]);
const isLoading = ref(true);
const categoriesLoading = ref(true);
const selectedCategoryId = ref(null); // 'null' nghĩa là "Tất cả"
const sortOrder = ref('newest');

// --- LOGIC MỚI ---

const fetchCategories = async () => {
  try {
    categories.value = await get_categories_api();
  } catch (err) {
    showNotification(err, "error");
  } finally {
    categoriesLoading.value = false;
  }
};

const fetchAllProducts = async () => {
  isLoading.value = true;
  try {
    allProducts.value = await get_products_api();
    
    // ===== SỬA ĐỔI TẠI ĐÂY: Đọc category từ URL =====
    const categoryQuery = route.query.category;
    if (categoryQuery) {
      selectedCategoryId.value = parseInt(categoryQuery, 10);
    }
    // =============================================
    
    applyFiltersAndSort(); 
  } catch (err) {
    showNotification(err, "error");
  } finally {
    isLoading.value = false;
  }
};

const handleCategoryClick = (categoryId) => {
  selectedCategoryId.value = categoryId;
  applyFiltersAndSort();
};

const applyFiltersAndSort = () => {
  let filtered = [];

  if (selectedCategoryId.value === null) {
    filtered = [...allProducts.value];
  } else {
    filtered = allProducts.value.filter(product => 
      product.categories.some(cat => cat.ID === selectedCategoryId.value)
    );
  }

  switch (sortOrder.value) {
    case 'price-asc':
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case 'price-desc':
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
      break;
  }
  products.value = filtered;
};

onBeforeMount(async () => {
  await Promise.all([
    fetchCategories(),
    fetchAllProducts()
  ]);
});

watch(sortOrder, applyFiltersAndSort);

watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    selectedCategoryId.value = parseInt(newCategory, 10);
  } else {
    selectedCategoryId.value = null;
  }
  applyFiltersAndSort();
});

</script>

<template>
  <div>
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">TẤT CẢ MÔ HÌNH - ĐỒ CHƠI TOKUSATSU</h1>
        <p class="category-description">{{ t('listProduct.categoryDescription') }}</p>
      </div>

      <div class="product-layout">
        <aside class="sidebar">
          <div class="sidebar-widget">
            <h3 class="widget-title">Danh Mục Sản Phẩm</h3>
            <LoadingSpinner v-if="categoriesLoading" message="Đang tải..." />
            <ul v-else class="category-list">
              <li>
                <a 
                  href="#" 
                  @click.prevent="handleCategoryClick(null)"
                  :class="{ active: selectedCategoryId === null }"
                >
                  Tất Cả Sản Phẩm
                </a>
              </li>
              <li v-for="cat in categories" :key="cat.ID">
                <a 
                  href="#" 
                  @click.prevent="handleCategoryClick(cat.ID)"
                  :class="{ active: selectedCategoryId === cat.ID }"
                >
                  {{ cat.name }}
                </a>
              </li>
            </ul>
          </div>
        </aside>
        
        <main class="main-content">
          <div class="toolbar">
            <div class="sort-filter">
              <select id="sort-by" v-model="sortOrder" class="form-input">
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          <LoadingSpinner v-if="isLoading" message="Đang tải sản phẩm..." />
          <div v-else-if="!isLoading && products.length === 0" class="no-products-state">
            <p>Không có sản phẩm nào để hiển thị.</p>
          </div>
          <div v-else class="product-grid">
            <ProductCard v-for="product in products" :key="product.ID" :product="product" />
          </div>
        </main>
        
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding-top: 40px;
  padding-bottom: 40px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--light-gray-color);
}

.category-description {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  color: var(--text-color);
  max-width: 600px;
  margin: 0 auto;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr; 
  gap: 40px;
}

@media (min-width: 992px) {
  .product-layout {
    grid-template-columns: 280px 1fr; 
  }
}

.sidebar-widget {
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 20px;
}

.widget-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--secondary-color);
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--light-gray-color);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.category-list a {
  display: block;
  padding: 10px 12px;
  text-decoration: none;
  color: var(--text-color);
  border-radius: 6px;
  font-weight: 500;
  transition: all var(--transition-speed) ease;
}

.category-list a:hover {
  background-color: var(--light-gray-color);
  color: var(--primary-color);
}

.category-list a.active {
  background-color: var(--primary-color);
  color: var(--white-color);
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
}

.sort-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-filter label {
  font-weight: 500;
  color: var(--text-color);
}

.form-input {
  padding: 8px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--light-gray-color);
  min-width: 200px;
}

.no-products-state {
  text-align: center;
  padding: 50px 0;
  font-size: 1.2rem;
  color: var(--text-color);
  background-color: var(--white-color);
  border-radius: var(--border-radius);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .form-input {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}
</style>
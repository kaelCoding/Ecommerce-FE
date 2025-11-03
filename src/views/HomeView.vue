<script setup>
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import { useProductStore } from '@/stores/product';
import { useI18n } from 'vue-i18n';
import ProductCard from '@/components/product/Card.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import UserFeedbackForm from '@/components/common/UserFeedbackForm.vue';

const { t } = useI18n();
const { showNotification } = useNotification();
const router = useRouter();

const productStore = useProductStore();

onBeforeMount(async () => {
  try {
    if (productStore.homePageProducts.length === 0) {
      await productStore.fetchProductsForHome();
    }
  } catch (err) {
    showNotification(err, "error");
  }
});
</script>

<template>
  <div class="container">
    <section class="hero-section">
      <div class="hero-image">
        <img src="/public/images/bg2.png" alt="Tuni Toku Hero Banner" />
      </div>
      <div class="hero-content">
        <h2 class="section-title">
          <span>{{ t('home.introTitle') }}</span>
        </h2>
         <p>Tại <strong>Tuni Toku</strong>, chúng tôi không chỉ bán đồ chơi, chúng tôi chia sẻ đam mê. Đây là nơi bạn có thể tìm thấy những chiếc <strong>DX Driver</strong> và <strong>Henshin Belt</strong> mà bạn hằng ao ước, khám phá bộ sưu tập <strong>Gaia Memory, Vistamp</strong> độc đáo, và sở hữu mô hình từ các series <strong>Kamen Rider, Super Sentai</strong> huyền thoại. Mỗi sản phẩm tại shop đều là <strong>hàng Bandai chính hãng</strong>, được lựa chọn cẩn thận để đảm bảo trải nghiệm sưu tầm tuyệt vời nhất.</p>
      </div>
    </section>

    <LoadingSpinner v-if="productStore.isLoading" :message="t('home.loading')" />
    
    <main v-else class="products-ctn">
      <section 
        v-for="categoryData in productStore.homePageProducts" 
        :key="categoryData.ID" 
        class="product-section"
      >
        <h2 class="section-title-center">{{ categoryData.name }}</h2>
        
        <div class="product-grid">
          <ProductCard 
            v-for="product in categoryData.products" 
            :key="product.ID" 
            :product="product" 
          />
        </div>

        <div class="view-all-button-container">
          <RouterLink 
            :to="{ path: '/products', query: { category: categoryData.ID } }" 
            class="btn-secondary"
          >
            Xem tất cả <i class="fas fa-arrow-right"></i>
          </RouterLink>
        </div>
      </section>

      <div v-if="!productStore.isLoading && productStore.homePageProducts.length === 0">
        <p>Không có sản phẩm nào để hiển thị.</p>
      </div>
    </main>

    <section>
      <UserFeedbackForm />
    </section>
  </div>
</template>

<style scoped>
.hero-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
}
@media (min-width: 992px) {
  .hero-section {
    grid-template-columns: 1fr 1fr;
  }
}
.hero-image {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.hero-image img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
.hero-content {
  flex-flow: column;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hero-content .section-title {
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-bottom: 20px;
  color: var(--secondary-color);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
}
.hero-content p {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  line-height: 1.6;
  color: var(--text-color);
}

.section-title-center {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 2rem;
}

.featured-categories {
  margin-bottom: 4rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6; /* Màu xám nhạt (giống ảnh mẫu) */
  border-radius: var(--border-radius);
  padding: 20px 10px;
  text-decoration: none;
  color: var(--secondary-color);
  font-weight: 600;
  text-align: center;
  transition: all var(--transition-speed) ease;
  border: 1px solid var(--light-gray-color);
}
.category-card:hover {
  background-color: #e5e7eb;
  transform: translateY(-3px);
  box-shadow: var(--box-shadow);
}
.category-icon-placeholder {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 10px;
}
.category-name {
  font-size: 0.95rem;
}

.products-ctn {
  padding-top: 0;
}

.product-section {
  margin-bottom: 4rem;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 cột trên mobile */
  gap: 15px;
}

.view-all-button-container {
  text-align: center;
  margin-top: 2rem;
}

.btn-secondary {
  background-color: var(--white-color);
  color: var(--secondary-color);
  border: 2px solid var(--light-gray-color);
  font-weight: 600;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all var(--transition-speed) ease;
}
.btn-secondary:hover {
  background-color: var(--light-gray-color);
  border-color: var(--light-gray-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
}
.btn-secondary i {
  margin-left: 5px;
}


@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (min-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.feedback-section {
  padding: 2rem;
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 40px;
}
</style>
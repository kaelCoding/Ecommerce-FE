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
    await productStore.fetchProductsForHome();
  } catch (err) {
    showNotification(err, "error");
  }
});

const goToProductList = () => {
  router.push({ name: 'product-list' });
};
</script>

<template>
  <div>
    <section class="hero-section">
      <h1 class="hero-title  visually-hidden">{{ t('home.introTitle') }}</h1>
      <button @click="goToProductList" class="btn-primary">{{ t('home.heroButton') }} !</button>
    </section>

    <section class="intro-section">
      <div class="container intro-content">
        <div class="intro-image-wrapper">
          <img src="/public/images/img2.jpg" loading="lazy" alt="Mô hình Kamen Rider và Super Sentai chính hãng" để class="intro-image" />
        </div>
        <div class="intro-text">
          <h2 class="section-title">
            <span>{{ t('home.introTitle') }}</span>
          </h2>
          <p v-html="t('home.introText')"></p>
        </div>
      </div>
    </section>
    <LoadingSpinner v-if="productStore.isLoading" :message="t('home.loading')" />
    <main v-else class="container">
      <div class="products-ctn">
        <section v-for="categoryData in productStore.homePageProducts" :key="categoryData.ID" class="product-section">
          <h2 class="page-title">{{ categoryData.name }}</h2>
          <div class="product-grid">
            <ProductCard v-for="product in categoryData.products" :key="product.ID" :product="product" />
          </div>
        </section>

        <div class="more-ctn">
          <RouterLink class="btn-primary" to="/products">{{ t('home.viewMore') }}</RouterLink>
        </div>
        <div v-if="!productStore.isLoading && productStore.homePageProducts.length === 0">
          <p>{{ t('home.noProducts') }}</p>
        </div>
      </div>
    </main>

    <br><br>
    <section class="container">
      <UserFeedbackForm/>
    </section>
    <br><br>
  </div>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/public/images/SUPER.jpg') no-repeat center center/cover;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-flow: column;
  color: var(--white-color);
  animation: fadeIn 1s ease-in-out;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.intro-section {
  padding: 80px 0;
  background-color: var(--white-color);
  text-align: center;
}

.intro-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.intro-image-wrapper {
  width: 100%;
  max-width: 600px;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  animation: fadeInUp 1s ease-in-out;
  max-height: 320px;
}

.intro-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform var(--transition-speed);
}

.intro-image:hover {
  transform: scale(1.05);
}

.intro-text {
  max-width: 600px;
}

.intro-text .section-title {
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-bottom: 20px;
  color: var(--secondary-color);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
}

.intro-text p {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  line-height: 1.6;
  color: var(--text-color);
}

.products-ctn {
  border-bottom: 1px solid var(--light-gray-color);
  border-top: 1px solid var(--light-gray-color);
  padding-top: 32px;
}

.product-section {
  margin-bottom: 4rem;
}

.more-ctn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 24px;
}

@media (min-width: 768px) {
  .intro-content {
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .intro-text {
    text-align: left;
  }
}

@media (max-width: 768px) {
  .intro-section {
    padding: 40px 0;
  }
  .intro-content {
    gap: 20px;
  }
  .hero-section {
    height: 40vh;
  }
}
</style>
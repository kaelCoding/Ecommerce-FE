<script setup>
import ProductCard from '@/components/product/Card.vue';
import { get_products_api } from '@/services/product';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const products = ref([]);
const router = useRouter();

const isLoding = ref(true)

onBeforeMount(async () => {
  isLoding.value = true
  await getProducts()
  isLoding.value = false
})

const getProducts = async () => {
  await get_products_api().then((res) => {
    products.value = res
  })
}

const goToProductList = () => {
  router.push({ name: 'product-list' });
};
</script>

<template>
  <div>
    <section class="hero-section">
      <div class="container">
        <button @click="goToProductList" class="btn-primary">MUA NGAY !</button>
        <p class="hero-subtitle">Khám phá những thiết kế mới nhất, mang phong cách hiện đại và đầy cảm hứng.</p>
      </div>
    </section>

    <main class="container product-section">
      <h2 class="page-title">Sản phẩm nổi bật</h2>
      <LoadingSpinner v-if="isLoding" message="Đang tải..."/>
      <div v-else class="product-grid">
        <ProductCard v-for="product in products" :key="product.ID" :product="product" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/public/images/SUPER.jpg') no-repeat center center/cover;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--white-color);
  animation: fadeIn 1s ease-in-out;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  font-weight: 300;
  margin-top: 32px;
}

.product-section {
  padding-top: 60px;
  padding-bottom: 60px;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 40px;
  color: var(--secondary-color);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
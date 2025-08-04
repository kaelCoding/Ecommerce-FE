<script setup>
import ProductCard from '@/components/product/Card.vue'; // Chỉnh lại đường dẫn nếu cần
import { get_products_api } from '@/services/product';
import { onBeforeMount, ref } from 'vue'; // Import ref để tạo biến reactive
import { useRouter } from 'vue-router';

const products = ref([]);
const router = useRouter();

onBeforeMount(async () => {
  await getProducts()
  console.log(products.value)
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
  <div class="home-view">
    <section class="hero-section">
      <div class="container hero-content">
        <!-- <h1 class="hero-title">Bộ sưu tập 2025</h1> -->
        <h1 class="hero-title"><button @click="goToProductList" class="hero-button">MUA NGAY!</button></h1>
        <p class="hero-subtitle">Khám phá những thiết kế mới nhất, mang phong cách hiện đại và đầy cảm hứng.</p>
        <!-- <button class="hero-button">MUA NGAY!</button> -->
      </div>
    </section>

    <main class="container product-section">
      <h2 class="section-title">Sản phẩm nổi bật</h2>
      <div class="product-grid">
        <ProductCard v-for="product in products" :key="product.ID" :product="product" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/public/background.jpg') no-repeat center center/cover;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--white-color);
  animation: fadeIn 1s ease-in-out;
}

.hero-content {
  max-width: 700px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

.hero-button {
  padding: 12px 30px;
  background-color: var(--primary-color);
  color: var(--white-color);
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.hero-button:hover {
  background-color: #2563EB; 
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

/* Product Section */
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  animation: fadeInUp 1s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

@media (max-width: 990px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 576px) {
  .section-title {
    font-size: 2rem;
  }
}
</style>
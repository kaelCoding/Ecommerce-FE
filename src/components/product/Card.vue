<script setup>
import router from '@/router';
import { defineProps } from 'vue';

const props = defineProps(["product"])

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const goToDetailProduct = (productId) => {
  router.push({ name: 'product-detail', params: { id: productId } });
};

</script>

<template>
  <div class="product-card" @click="goToDetailProduct(product.ID)">
    <div class="card-image-wrapper">
      <img :src="product.image_urls[0]" :alt="product.name" class="product-image">
      <!-- <div class="overlay">
        <button class="add-to-cart-btn">Thêm vào giỏ</button>
      </div> -->
    </div>
    <div class="card-content">
      <div class="">
        <h3 class="product-name">{{ product.name }}</h3>
      </div>
      <p class="product-price">{{ formatPrice(product.price) }}</p>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all var(--transition-speed) ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--box-shadow);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; 
  overflow: hidden;
  background-color: var(--light-gray-color);
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-speed) ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity var(--transition-speed) ease;
}

.product-card:hover .overlay {
  opacity: 1;
}

.add-to-cart-btn {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: var(--white-color);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
  transform: translateY(20px);
  transition: all var(--transition-speed) ease;
}

.product-card:hover .add-to-cart-btn {
  transform: translateY(0);
}

.card-content {
  padding: 15px;
  flex-grow: 1;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--secondary-color);
}

.product-category {
  font-size: 0.85rem;
  color: #6B7280;
  margin-bottom: 10px;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
  text-align: start;
}

@media (max-width: 768px) {
  .product-name {
    font-size: 0.95rem; 
  }

  .product-category {
    font-size: 0.8rem; 
    margin-bottom: 5px;
  }

  .product-price {
    font-size: 1rem; 
  }

  .card-content {
    padding: 10px; 
  }
}
</style>
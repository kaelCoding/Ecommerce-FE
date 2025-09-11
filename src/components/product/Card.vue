<script setup>
import { defineProps, computed } from 'vue';
import { formatPrice } from '@/composables/useUtils';
import { get_auth_user } from '@/stores/auth';

const props = defineProps(["product"])

const authUser = get_auth_user;

const discountPercentage = computed(() => {
  return authUser.value?.discountPercentage || 0;
});

const discountedPrice = computed(() => {
  if (props.product && discountPercentage.value > 0) {
    return props.product.price * (1 - discountPercentage.value);
  }
  return props.product?.price;
});
</script>

<template>
  <RouterLink :to="'/products/detail/' + product.ID" class="product-card">
  <div class="card-image-wrapper">
    <img :src="product.image_urls[0]" :alt="product.name + ' - Đồ chơi Tokusatsu chính hãng'" loading="lazy" class="product-image">
    <div class="overlay">
      <span class="btn-primary">Xem chi tiết</span>
    </div>
    <div v-if="discountPercentage > 0" class="discount-badge">
      -{{ discountPercentage }}%
    </div>
  </div>
  <div class="card-content">
    <h3 class="product-name">{{ product.name }}</h3>
    <div class="price-container">
      <p v-if="discountPercentage > 0" class="original-price">{{ formatPrice(product.price) }}</p>
      <p class="product-price">{{ formatPrice(discountedPrice) }}</p>
    </div>
  </div>
</RouterLink>
</template>

<style scoped>
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

.product-card {
  background-color: var(--body-color);
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

.product-card:hover .overlay {
  opacity: 1;
}

.card-content {
  display: flex;
  flex-flow: column;
  padding: 15px;
  flex-grow: 1;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--secondary-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
}

.original-price {
  font-size: 0.9rem;
  font-weight: 500;
  color: #999;
  text-decoration: line-through;
}

.discounted-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.product-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
  text-align: start;
  margin-top: auto;
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

@media (max-width: 480px) {
  .btn, .btn-primary {
    display: none;
  }
}
</style>

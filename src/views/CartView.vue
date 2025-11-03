<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useNotification } from '@/composables/useNotification';
import { formatPrice } from '@/composables/useUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const cartStore = useCartStore();
const { showNotification } = useNotification();
const router = useRouter();

const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 0) return;
  try {
    await cartStore.updateItemQuantity(itemId, newQuantity);
  } catch (err) {
    showNotification(err, 'error');
  }
};

const goToCheckout = () => {
  router.push('/checkout');
};
</script>

<template>
  <div class="container cart-page">
    <h1 class="page-title">GIỎ HÀNG CỦA BẠN</h1>
    
    <LoadingSpinner v-if="cartStore.isLoading" message="Đang cập nhật giỏ hàng..." />
    
    <div v-if="!cartStore.isLoading && cartStore.items.length === 0" class="cart-empty card-white">
      <p>Giỏ hàng của bạn đang trống.</p>
      <RouterLink to="/products" class="btn-primary">Tiếp tục mua sắm</RouterLink>
    </div>

    <div v-else class="cart-content card-white">
      <table class="cart-table-desktop">
        <thead>
          <tr>
            <th colspan="2">Sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tạm tính</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartStore.items" :key="item.ID" class="cart-item">
            <td class="item-image-col">
              <img :src="item.product.image_urls?.[0]" :alt="item.product.name" class="item-image" />
            </td>
            <td class="item-details-col">
              <h3 class="item-name">{{ item.product.name }}</h3>
              <p class="item-category">{{ item.product.categories?.[0]?.name }}</p>
            </td>
            <td class="item-price-col">
              <p class="item-price">{{ formatPrice(item.product.price) }}</p>
            </td>
            <td class="item-quantity-col">
              <div class="quantity-selector">
                <button @click="updateQuantity(item.ID, item.quantity - 1)" :disabled="cartStore.isLoading">-</button>
                <input type="text" :value="item.quantity" readonly />
                <button @click="updateQuantity(item.ID, item.quantity + 1)" :disabled="cartStore.isLoading">+</button>
              </div>
            </td>
            <td class="item-subtotal-col">
              <p class="item-subtotal">{{ formatPrice(item.product.price * item.quantity) }}</p>
            </td>
            <td class="item-remove-col">
              <button @click="cartStore.removeItem(item.ID)" class="btn-remove" :disabled="cartStore.isLoading">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="cart-list-mobile">
        <div v-for="item in cartStore.items" :key="item.ID" class="cart-item-mobile">
          <div class="item-main">
            <img :src="item.product.image_urls?.[0]" :alt="item.product.name" class="item-image" />
            <div class="item-details">
              <h3 class="item-name">{{ item.product.name }}</h3>
              <p class="item-category">{{ item.product.categories?.[0]?.name }}</p>
              <p class="item-price">{{ formatPrice(item.product.price) }}</p>
            </div>
          </div>
          <div class="item-footer">
            <div class="quantity-selector">
              <button @click="updateQuantity(item.ID, item.quantity - 1)" :disabled="cartStore.isLoading">-</button>
              <input type="text" :value="item.quantity" readonly />
              <button @click="updateQuantity(item.ID, item.quantity + 1)" :disabled="cartStore.isLoading">+</button>
            </div>
            <p class="item-subtotal">{{ formatPrice(item.product.price * item.quantity) }}</p>
            <button @click="cartStore.removeItem(item.ID)" class="btn-remove" :disabled="cartStore.isLoading">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-actions">
          <RouterLink to="/products" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i> Tiếp tục xem sản phẩm
          </RouterLink>
        </div>
        
        <div class="summary-total-wrapper">
          <div v_if="cartStore.discountPercentage > 0" class="summary-row">
            <span>Tạm tính (gốc):</span>
            <span class="original-price">{{ formatPrice(cartStore.cartOriginalTotalPrice) }}</span>
          </div>
          <div v-if="cartStore.discountPercentage > 0" class="summary-row discount-row">
            <span>Giảm giá VIP (-{{ (cartStore.discountPercentage * 100).toFixed(0) }}%):</span>
            <span class="discount-amount">-{{ formatPrice(cartStore.cartOriginalTotalPrice - cartStore.cartTotalPrice) }}</span>
          </div>
          
          <div class="summary-row final-total-row">
            <span class="total-label">Tổng cộng:</span>
            <strong class="total-price">{{ cartStore.formattedCartTotalPrice }}</strong>
          </div>

          <button class="btn-primary btn-checkout" @click="goToCheckout" :disabled="cartStore.isLoading">
            Tiến Hành Thanh Toán
          </button>
        </div>
      </div>
      </div>
  </div>
</template>

<style scoped>
.card-white {
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: clamp(20px, 4vw, 40px);
  overflow: hidden;
}

.container {
  margin: 40px auto;
}

.page-title {
  text-align: center;
  margin-bottom: 40px;
}

.cart-empty {
  text-align: center;
  padding: 60px;
}
.cart-empty p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.cart-table-desktop {
  width: 100%;
  border-collapse: collapse;
}

.cart-table-desktop th {
  text-align: left;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  text-transform: uppercase;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--light-gray-color);
}
.cart-table-desktop th:nth-child(3),
.cart-table-desktop th:nth-child(4),
.cart-table-desktop th:nth-child(5) {
  text-align: center;
}

.cart-item {
  border-bottom: 1px solid var(--light-gray-color);
}
.cart-item:last-child {
  border-bottom: none;
}

.cart-item td {
  padding: 20px 10px;
  vertical-align: middle;
}

.item-image-col { width: 100px; }
.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--border-radius);
  border: 1px solid var(--light-gray-color);
}

.item-details-col { width: 40%; }
.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 5px;
}
.item-category {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
}

.item-price-col, .item-subtotal-col {
  width: 15%;
  text-align: center;
}
.item-price, .item-subtotal {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.item-quantity-col { width: 15%; }
.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  overflow: hidden;
  height: clamp(35px, 5vh, 40px);
  border: 1px solid var(--light-gray-color);
}
.quantity-selector input {
  width: clamp(35px, 6vw, 45px);
  height: 100%;
  text-align: center;
  background-color: var(--white-color);
  color: var(--text-color);
  border: none;
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 600;
}
.quantity-selector button {
  background-color: var(--light-gray-color);
  color: var(--text-color);
  border: none;
  width: clamp(30px, 5vw, 35px);
  height: 100%;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  cursor: pointer;
  transition: background-color var(--transition-speed);
}
.quantity-selector button:hover { background-color: #d1d5db; }
.quantity-selector button:disabled { opacity: 0.5; cursor: not-allowed; }

.item-remove-col { width: 5%; text-align: right; }
.btn-remove {
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
}
.btn-remove:disabled { opacity: 0.5; }

.cart-list-mobile {
  display: none;
}

.cart-summary {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.summary-actions .btn-secondary {
  background-color: var(--white-color);
  color: var(--secondary-color);
  border: 2px solid var(--light-gray-color);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.summary-actions .btn-secondary:hover {
  background-color: var(--light-gray-color);
  border-color: var(--light-gray-color);
  transform: none;
  box-shadow: none;
}

.summary-total-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Căn phải cho các hàng */
  gap: 10px;
  min-width: 300px; /* Đảm bảo đủ rộng */
}

.summary-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 1rem;
}

.summary-row span:first-child {
  color: var(--text-color);
  opacity: 0.9;
}
.summary-row span:last-child {
  font-weight: 600;
  color: var(--secondary-color);
}

.summary-row .original-price {
  text-decoration: line-through;
  font-size: 0.9rem;
  opacity: 0.7;
}

.summary-row.discount-row .discount-amount {
  color: #dc2626; /* Màu đỏ cho giảm giá */
}

.summary-row.final-total-row {
  border-top: 1px solid var(--light-gray-color);
  padding-top: 10px;
  margin-top: 5px;
}

.final-total-row .total-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}
.final-total-row .total-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

.summary-total-wrapper .btn-checkout {
  width: 100%; 
  margin-top: 15px;
  font-size: 1.1rem;
}

.summary-total {
  display: contents;
}
.total-label {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-color);
}
.total-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
}
.btn-checkout {
  font-size: 1.1rem;
}

@media (max-width: 992px) {
  .cart-table-desktop {
    display: none;
  }
  .cart-list-mobile {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .cart-item-mobile {
    border: 1px solid var(--light-gray-color);
    border-radius: var(--border-radius);
    padding: 15px;
  }
  .item-main {
    display: flex;
    gap: 15px;
    border-bottom: 1px solid var(--light-gray-color);
    padding-bottom: 15px;
  }
  .item-main .item-image {
    width: 80px;
    height: 80px;
  }
  .item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
  }
  /* ===== THÊM MỚI (Cho đồng bộ) ===== */
  .item-details .item-category {
    font-size: 0.9rem;
    color: var(--text-color);
    opacity: 0.8;
    margin-bottom: 5px;
  }
}

@media (max-width: 768px) {
  .container {
    margin: 20px auto;
  }

  .cart-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .summary-actions .btn-secondary {
    justify-content: center;
  }

  .summary-total {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .total-label {
    display: flex;
    justify-content: space-between;
    font-size: 1.1rem;
  }

  .total-price {
    font-size: 1.5rem;
    text-align: right;
  }
  
  .btn-checkout {
    font-size: 1.1rem;
  }

  .summary-total-wrapper {
    align-items: stretch; /* Căn full-width trên mobile */
    min-width: unset;
  }
  .final-total-row .total-price {
    text-align: right;
  }
}
</style>
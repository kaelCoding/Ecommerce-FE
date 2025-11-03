<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { checkoutFromCartAPI } from '@/services/order';
import { useNotification } from '@/composables/useNotification';
import { get_auth_user } from '@/stores/auth';
import { formatPrice } from '@/composables/useUtils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const cartStore = useCartStore();
const { showNotification } = useNotification();
const router = useRouter();
const authUser = get_auth_user;

const isSubmitting = ref(false);
const customerInfo = ref({
  name: '',
  phone: '',
  address: '',
  paymentMethod: 'cod',
});

onMounted(() => {
  if (authUser.value) {
    customerInfo.value.name = authUser.value.username;
  }
  
  if (cartStore.items.length === 0) {
    showNotification('Giỏ hàng của bạn đang trống.', 'error');
    router.push('/cart');
  }
});

const submitCartOrder = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      customerName: customerInfo.value.name,
      customerPhone: customerInfo.value.phone,
      customerAddress: customerInfo.value.address,
      paymentMethod: customerInfo.value.paymentMethod,
    };
    await checkoutFromCartAPI(payload);
    
    showNotification('Đặt hàng thành công! Chúng tôi sẽ sớm liên hệ với bạn.', 'success');
    cartStore.clearCart();
    router.push('/');

  } catch (err) {
    showNotification(err, 'error');
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="container checkout-page">
    <div class="checkout-layout">
      
      <div class="checkout-form card-white">
        <h1 class="page-title">Thông Tin Thanh Toán</h1>
        <form @submit.prevent="submitCartOrder">
          <div class="form-group">
            <label for="name">Họ và Tên</label>
            <input id="name" type="text" class="form-input" v-model="customerInfo.name" placeholder="Nhập họ và tên của bạn" required>
          </div>
          <div class="form-group">
            <label for="phone">Số điện thoại</label>
            <input id="phone" type="tel" class="form-input" v-model="customerInfo.phone" placeholder="Nhập số điện thoại" required>
          </div>
          <div class="form-group">
            <label for="address">Địa chỉ</label>
            <textarea id="address" class="form-input" v-model="customerInfo.address" placeholder="Nhập địa chỉ nhận hàng" required></textarea>
          </div>
          <div class="form-group">
            <label>Phương thức thanh toán</label>
            <div class="payment-options">
              <div class="radio-label">
                <input type="radio" v-model="customerInfo.paymentMethod" value="cod">
                <span>Thanh toán khi nhận hàng (COD)</span>
              </div>
              <div class="radio-label">
                <input type="radio" v-model="customerInfo.paymentMethod" value="bank_transfer">
                <span>Chuyển khoản ngân hàng</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="checkout-summary card-white">
        <h3>Đơn Hàng Của Bạn</h3>
        
        <div class="summary-items">
          <div v-for="item in cartStore.items" :key="item.ID" class="summary-item">
            <img :src="item.product.image_urls[0]" :alt="item.product.name" class="item-image" />
            <div class="item-details">
              <span class="item-name">{{ item.product.name }} (x{{ item.quantity }})</span>
              <span class="item-price">{{ formatPrice(item.product.price * item.quantity) }}</span>
            </div>
          </div>
        </div>
        
        <div class="summary-total">
          <div class="summary-row">
            <span>Tạm tính (gốc)</span>
            <strong>{{ formatPrice(cartStore.cartOriginalTotalPrice) }}</strong>
          </div>
          
          <div class="summary-row discount-row" v-if="cartStore.discountPercentage > 0">
            <span>Giảm giá VIP (-{{ (cartStore.discountPercentage * 100).toFixed(0) }}%)</span>
            <strong>-{{ formatPrice(cartStore.cartOriginalTotalPrice - cartStore.cartTotalPrice) }}</strong>
          </div>

          <div class="summary-row">
            <span>Phí vận chuyển</span>
            <strong>Sẽ thông báo sau</strong>
          </div>

          <div class="summary-row total">
            <span>Tổng cộng (chưa gồm ship)</span>
            <strong>{{ cartStore.formattedCartTotalPrice }}</strong>
          </div>
        </div>

        <button @click="submitCartOrder" class="btn-primary btn-checkout" :disabled="isSubmitting">
          <LoadingSpinner v-if="isSubmitting" message="" />
          <span v-else>Xác Nhận Đặt Hàng</span>
        </button>
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
}

.container {
  margin: 40px auto;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 30px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 8px;
}
.form-input, textarea.form-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 1rem;
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  background-color: var(--white-color);
  color: var(--text-color);
  transition: all var(--transition-speed) ease;
}
.form-input:focus, textarea.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.3);
}
textarea.form-input { resize: vertical; min-height: 100px; }
.payment-options { display: flex; flex-direction: column; gap: 10px; }
.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  cursor: pointer;
}
.radio-label input[type="radio"] { accent-color: var(--primary-color); }

.checkout-summary {
  position: sticky;
  top: 100px;
  height: fit-content;
}
.checkout-summary h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 25px;
  border-bottom: 1px solid var(--light-gray-color);
  padding-bottom: 15px;
}

.summary-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 10px;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}
.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--light-gray-color);
}
.item-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.item-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--secondary-color);
}
.item-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
}

.summary-total {
  border-top: 1px solid var(--light-gray-color);
  padding-top: 20px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  margin-bottom: 15px;
}
.summary-row.total {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-top: 10px;
}
.summary-row.discount-row {
  color: #dc2626; /* Màu đỏ */
}
.summary-row.discount-row strong {
  color: #dc2626;
}

.summary-row.original-price-striked {
  text-decoration: line-through;
  font-size: 0.9rem;
  opacity: 0.7;
}
.btn-checkout {
  width: 100%;
  margin-top: 20px;
  font-size: 1.1rem;
}
.btn-checkout:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}
.btn-checkout :deep(.spinner) {
  width: 20px;
  height: 20px;
  border-width: 3px;
  border-top-color: var(--white-color);
  margin: 0;
}

@media (max-width: 992px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  .checkout-summary {
    position: relative;
    top: 0;
    margin-top: 30px;
  }
}
</style>
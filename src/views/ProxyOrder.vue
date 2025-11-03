<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; 
import { fetchMercariProductAPI, searchMercariAPI } from '@/services/proxy.js';
import { submitProxyOrderAPI } from '@/services/order.js';
import { formatPrice } from '@/composables/useUtils'; 
import { useNotification } from '@/composables/useNotification'; 
import { get_auth_user } from '@/stores/auth'; 
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useI18n } from 'vue-i18n'; 

const { t } = useI18n();
const router = useRouter();
const { showNotification } = useNotification();

const mercariUrl = ref('');
const searchKeyword = ref('');

const isFetching = ref(false); 
const isSearching = ref(false); 

const error = ref(null);
const productInfo = ref(null);
const searchResults = ref([]);
const selectedImageIndex = ref(0);
const loadingItemId = ref(null);

const quantity = ref(1);
const isCheckoutModalOpen = ref(false);
const isSubmitting = ref(false);
const customerInfo = ref({
  phone: '',
  address: '',
  paymentMethod: 'cod',
});

const EXCHANGE_RATE = 185; 
const SERVICE_FEE_PERCENT = 0.05; 

const formatPriceJPY = (value) => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
};

const mainImage = computed(() => {
  if (productInfo.value && productInfo.value.imageURLs && productInfo.value.imageURLs.length > 0) {
    return productInfo.value.imageURLs[selectedImageIndex.value];
  }
  return '';
});

const translatedCondition = computed(() => {
  if (!productInfo.value || !productInfo.value.condition) return 'Không rõ';
  const conditionMap = {
    "新品、未使用": "Mới, chưa sử dụng",
    "未使用に近い": "Gần như mới",
    "目立った傷や汚れなし": "Không có vết bẩn/trầy xước đáng kể",
    "やや傷や汚れあり": "Có một chút vết bẩn/trầy xước",
    "傷や汚れあり": "Có vết bẩn/trầy xước",
    "全体的に状態が悪い": "Tình trạng chung không tốt",
    "Không rõ": "Không rõ"
  };
  return conditionMap[productInfo.value.condition] || productInfo.value.condition;
});

const formattedPriceJPY = computed(() => {
  if (!productInfo.value) return '';
  return formatPriceJPY(productInfo.value.priceJPY);
});

const basePriceVND = computed(() => {
  if (!productInfo.value) return 0;
  return productInfo.value.priceJPY * EXCHANGE_RATE;
});

const serviceFeeVND = computed(() => {
  return basePriceVND.value * SERVICE_FEE_PERCENT;
});

const estimatedPriceVND = computed(() => {
  return basePriceVND.value + serviceFeeVND.value;
});

const totalEstimatedPriceVND = computed(() => {
  return estimatedPriceVND.value * quantity.value;
});

const formattedTotalVND = computed(() => {
  return formatPrice(totalEstimatedPriceVND.value);
});

const handleFetchProduct = async () => {
  if (!mercariUrl.value.includes('jp.mercari.com/item/')) {
    error.value = 'URL không hợp lệ. Vui lòng dán link sản phẩm từ jp.mercari.com.';
    return;
  }
  isFetching.value = true;
  error.value = null;
  productInfo.value = null; 
  try {
    const data = await fetchMercariProductAPI(mercariUrl.value);
    productInfo.value = data;
    selectedImageIndex.value = 0;
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.error || 'Không thể lấy thông tin sản phẩm. Vui lòng thử lại sau.';
  } finally {
    isFetching.value = false;
  }
};

const handleSearchProduct = async () => {
  if (!searchKeyword.value) {
    error.value = 'Vui lòng nhập từ khóa tìm kiếm.';
    return;
  }
  isSearching.value = true;
  error.value = null;
  searchResults.value = []; 
  try {
    const data = await searchMercariAPI(searchKeyword.value);
    searchResults.value = data || []; 
    if (searchResults.value.length === 0) {
      error.value = "Không tìm thấy sản phẩm nào khớp với từ khóa.";
    }
  } catch (err)
 {
    console.error(err);
    error.value = err.response?.data?.error || 'Không thể tìm kiếm. Vui lòng thử lại sau.';
  } finally {
    isSearching.value = false;
  }
};

const clearSearchResults = () => {
  searchResults.value = [];
  searchKeyword.value = '';
  error.value = null;
};

const handleClear = () => {
  productInfo.value = null;
  mercariUrl.value = '';
  error.value = null;
  resetForm();
};

const goBackToSearch = () => {
  productInfo.value = null;
  error.value = null;
  mercariUrl.value = ''; 
  resetForm();
};

const selectSearchResult = async (item) => {
  if (loadingItemId.value) return; 
    loadingItemId.value = item.itemURL; 
    mercariUrl.value = item.itemURL;
  try {
    await handleFetchProduct();
  } catch (err) {
    console.error("Lỗi khi chọn sản phẩm:", err);
  } finally {
    loadingItemId.value = null;
  }
};

const incrementQuantity = () => quantity.value++;
const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value--;
};

const openCheckoutModal = () => { isCheckoutModalOpen.value = true; };
const closeCheckoutModal = () => {
  isCheckoutModalOpen.value = false;
};

const resetForm = () => {
  customerInfo.value = { phone: '', address: '', paymentMethod: 'cod' };
  quantity.value = 1;
};

const handleCheckout = () => {
  if (get_auth_user.value) {
    openCheckoutModal();
  } else {
    showNotification('Bạn cần đăng nhập để tiến hành đặt hàng.', 'error');
    router.push({
      path: '/login',
      query: { redirect: '/proxy-order' } 
    });
  }
};

const submitProxyOrder = async () => {
  isSubmitting.value = true;
  const orderPayload = {
    mercariURL: mercariUrl.value,
    mercariItemID: productInfo.value.mercariItemID,
    productName: productInfo.value.name,
    productPriceJPY: productInfo.value.priceJPY,
    productCondition: productInfo.value.condition,
    productDescription: productInfo.value.description,
    imageURLs: productInfo.value.imageURLs,
    quantity: quantity.value,
    customerName: get_auth_user.value.username, 
    customerPhone: customerInfo.value.phone,
    customerAddress: customerInfo.value.address,
    customerEmail: get_auth_user.value.email,
    paymentMethod: customerInfo.value.paymentMethod,
  };

  try {
    await submitProxyOrderAPI(orderPayload); 
    showNotification('Đặt hàng hộ thành công! Chúng tôi sẽ sớm liên hệ với bạn.', 'success');
    closeCheckoutModal();
    handleClear();
  } catch (err) {
    console.error("Failed to submit proxy order:", err);
    showNotification(err.error || err, 'error'); 
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="proxy-order-page container">
    <div v-if="!productInfo && searchResults.length === 0" class="input-section">
      <div class="input-card">
        <h1 class="page-title">ĐẶT HÀNG TẠI MERCARI</h1>
        <p class="page-description">
          Dán link sản phẩm từ <strong>jp.mercari.com</strong> vào ô bên dưới.
        </p>

        <form @submit.prevent="handleFetchProduct" class="fetch-form">
          <input
            v-model="mercariUrl"
            type="text"
            placeholder="https://jp.mercari.com/item/m123456789..."
            class="url-input"
            :disabled="isFetching || isSearching"
          />
          <button type="submit" class="btn-primary" :disabled="isFetching || isSearching">
            <span v-if="!isFetching">Kiểm Tra Sản Phẩm</span>
            <LoadingSpinner v-if="isFetching" message="Đang tải..."></LoadingSpinner>
          </button>
        </form>

        <div class="search-divider">--- HOẶC TÌM KIẾM SẢN PHẨM ---</div>

        <form @submit.prevent="handleSearchProduct" class="search-form">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Nhập tên sản phẩm (ví dụ: Gundam, Driver...)"
            class="url-input"
            :disabled="isFetching || isSearching"
          />
          <button type="submit" class="btn-primary" :disabled="isFetching || isSearching">
            <span v-if="!isSearching">Tìm Kiếm</span>
            <LoadingSpinner v-if="isSearching" message="Đang tải..."></LoadingSpinner>
          </button>
        </form>
        
        <LoadingSpinner v-if="isFetching || isSearching" message="Đang tải dữ liệu từ Mercari, vui lòng chờ..."></LoadingSpinner>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
    
    <div v-else-if="productInfo" class="product-display">
      <div class="product-images">
        <div class="main-image-wrapper">
          <img :src="mainImage" alt="Product Image" class="main-image" />
        </div>
        <div class="thumbnail-list">
          <img
            v-for="(image, index) in productInfo.imageURLs"
            :key="index"
            :src="image"
            :alt="'Thumbnail ' + (index + 1)"
            :class="{ active: index === selectedImageIndex }"
            @click="selectedImageIndex = index"
            class="thumbnail-item"
          />
        </div>
      </div>

      <div class="product-info">
        <h2 class="product-name">{{ productInfo.name }}</h2>
        <div class="product-specs">
          <div class="spec-item">
            <span class="spec-label">Giá gốc (JPY)</span>
            <span class="spec-value price-jpy">{{ formattedPriceJPY }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Tình trạng</span>
            <span class="spec-value">{{ translatedCondition }}</span>
          </div>
        </div>

        <div class="actions">
          <span class="quantity-label">Số lượng:</span>
          <div class="quantity-selector">
            <button @click="decrementQuantity" aria-label="Giảm số lượng">-</button>
            <input type="text" :value="quantity" readonly aria-label="Số lượng hiện tại" />
            <button @click="incrementQuantity" aria-label="Tăng số lượng">+</button>
          </div>
        </div>

        <div class="product-description">
          <strong>Mô tả (tiếng Nhật):</strong>
          <p class="pre-line-text">{{ productInfo.description }}</p>
          <em class="translation-note">Lưu ý: Chức năng dịch mô tả sản phẩm sẽ sớm được cập nhật.</em>
        </div>

        <div class="price-summary">
          <h3>Báo Giá Dự Kiến (VNĐ)</h3>
          <div class="price-item">
            <span>Giá gốc ({{ formattedPriceJPY }})</span>
            <span>~ {{ formatPrice(basePriceVND) }}</span>
          </div>
          <div class="price-item">
            <span>Tỷ giá JPY-VND</span>
            <span>1 JPY = {{ EXCHANGE_RATE }} VND</span>
          </div>
          <div class="price-item">
            <span>Phí dịch vụ (5%)</span>
            <span>{{ formatPrice(serviceFeeVND) }}</span>
          </div>
          <hr class="divider" />
          <div class="price-total">
            <strong>Tổng cộng (x{{ quantity }} sp)</strong>
            <strong>{{ formattedTotalVND }}</strong>
          </div>
          <p class="note">
            *Đây là giá dự kiến (chưa bao gồm phí vận chuyển nội địa Nhật nếu có).
            <br/>*Phí vận chuyển về VN (195K/kg) sẽ được tính sau.
          </p>
        </div>
        <div class="action-buttons">
          <button @click="handleCheckout" class="btn-primary btn-order">
            Tiến Hành Đặt Hàng
          </button>
          
          <button v-if="searchResults.length > 0" @click="goBackToSearch" class="btn btn-secondary">
            Quay lại kết quả
          </button>
          <button v-else @click="handleClear" class="btn btn-secondary">
            Tìm sản phẩm khác
          </button>
        </div>
      </div>
    </div>
    
    <div v-else-if="searchResults.length > 0" class="search-results-container">
      <div class="search-grid-header">
        <h2>Kết quả tìm kiếm cho "{{ searchKeyword }}"</h2> 
        <button @click="clearSearchResults" class="btn btn-secondary">
          Quay lại
        </button>
      </div>
      <div class="product-grid">
        <div
          v-for="item in searchResults"
          :key="item.itemURL"
          class="search-item-card"
          @click="selectSearchResult(item)"
        >
          <div v-if="loadingItemId === item.itemURL" class="card-loading-overlay">
            <LoadingSpinner /> 
          </div>

          <div class="card-image-container">
            <img :src="item.imageURL" :alt="item.name" class="card-image" />
            <span v-if="item.isSoldOut" class="sold-out-badge">Đã Bán</span>
          </div>
          <div class="card-content">
            <h3 class="card-name">{{ item.name }}</h3>
            <p class="card-price">{{ formatPriceJPY(item.priceJPY) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isCheckoutModalOpen" class="modal-backdrop" @click.self="closeCheckoutModal">
        <div class="checkout-modal">
          <div class="modal-header">
            <h3>Xác Nhận Đặt Hàng Hộ</h3>
            <button class="close-btn" @click="closeCheckoutModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <LoadingSpinner v-if="isSubmitting" message="Đang xử lý đơn hàng..." />
            <div v-else>
              <div class="summary">
                <p>Sản phẩm: <strong>{{ productInfo.name }}</strong></p>
                <p>Số lượng: <strong>{{ quantity }}</strong></p>
                <p>Tổng tiền hàng (ước tính): <strong>{{ formattedTotalVND }}</strong></p>
                <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 5px;">(Chưa bao gồm phí ship. Phí ship 195K/kg sẽ được thanh toán khi hàng về.)</p>
              </div>

              <form @submit.prevent="submitProxyOrder">
                <div class="form-group">
                  <label for="phone">Số điện thoại</label>
                  <input id="phone" type="tel" class="form-input" v-model="customerInfo.phone"
                    placeholder="Nhập số điện thoại của bạn" required>
                </div>
                <div class="form-group">
                  <label for="address">Địa chỉ nhận hàng</label>
                  <textarea id="address" class="form-input" v-model="customerInfo.address"
                    placeholder="Nhập địa chỉ chi tiết của bạn" required></textarea>
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

                    <transition name="fade">
                      <div v-if="customerInfo.paymentMethod === 'bank_transfer'" class="qr-code-container">
                        <img src="/public/images/image.png" alt="Mã QR chuyển khoản" class="qr-code-image">
                        <p class="qr-code-note">
                          Sau khi thanh toán xong hãy liên lạc với fanpage để xác nhận.
                        </p>
                      </div>
                    </transition>
                    </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn" @click="closeCheckoutModal">Hủy</button>
                  <button type="submit" class="btn-primary">Xác Nhận Đặt Hàng</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
/* (Style của bạn giữ nguyên) */
.proxy-order-page {
  padding-top: 20px;
  padding-bottom: 60px;
  animation: fadeInUp 0.5s ease;
}

.input-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.input-card {
  width: 100%;
  max-width: 700px;
  padding: 30px;
  border-radius: var(--border-radius);
  background-color: var(--white-color);
  box-shadow: var(--box-shadow);
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 10px;
}

.page-description {
  text-align: center;
  font-size: 1rem;
  margin-bottom: 30px;
  color: var(--text-color);
}

.fetch-form, .search-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.url-input {
  padding: 14px 20px;
  font-size: 1rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--light-gray-color);
  background-color: var(--white-color);
  color: var(--text-color);
  transition: all var(--transition-speed) ease;
}

.url-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.3); 
}

.search-divider {
  text-align: center;
  font-weight: 500;
  color: var(--text-color);
  opacity: 0.7;
  margin: 25px 0;
  font-size: 0.9rem;
}

.product-display {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-top: 20px;
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: clamp(20px, 4vw, 40px);
  overflow: hidden;
}

@media (min-width: 992px) {
  .product-display {
    grid-template-columns: 4fr 5fr;
    gap: 50px;
  }
}

.main-image-wrapper {
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
}
.product-images .main-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  background-color: #f9f9f9;
}

.thumbnail-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 15px;
}

.thumbnail-item {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.6;
  transition: all var(--transition-speed) ease;
  border: 2px solid var(--light-gray-color);
}

.thumbnail-item:hover {
  opacity: 1;
}
.thumbnail-item.active {
  opacity: 1;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.3);
}

.product-info {
  display: flex;
  flex-direction: column;
}
.product-info .product-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 20px;
  line-height: 1.3;
}

.product-specs {
  background-color: var(--white-color);
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-bottom: 25px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  font-size: 1.1rem;
}
.spec-item + .spec-item {
  border-top: 1px solid var(--light-gray-color);
}

.spec-label {
  font-weight: 500;
  color: var(--text-color);
  opacity: 0.8;
}

.spec-value {
  font-weight: 600;
  color: var(--secondary-color);
}

.price-jpy {
  font-size: 1.2rem;
  color: var(--primary-color);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 25px;
  align-items: center;
}
.quantity-label {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-color);
}
.quantity-selector {
  display: flex;
  align-items: center;
  border-radius: var(--border-radius);
  overflow: hidden;
  height: clamp(40px, 5vh, 48px);
}
.quantity-selector input {
  width: clamp(40px, 6vw, 50px);
  height: 100%;
  text-align: center;
  background-color: var(--white-color);
  color: var(--text-color);
  border: none;
  border-top: 1px solid var(--light-gray-color);
  border-bottom: 1px solid var(--light-gray-color);
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  font-weight: 600;
}
.quantity-selector button {
  background-color: var(--light-gray-color);
  color: var(--text-color);
  border: none;
  width: clamp(35px, 5vw, 40px);
  height: 100%;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  cursor: pointer;
  transition: background-color var(--transition-speed);
}
.quantity-selector button:hover {
  background-color: #d1d5db;
}

.product-description {
  margin-bottom: 25px;
}

.product-description strong {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--secondary-color);
}

.product-description p {
  margin-top: 10px;
  padding: 15px;
  background-color: var(--white-color);
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.7;
}

.translation-note {
  display: block;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--text-color);
  opacity: 0.7;
  margin-top: 10px;
}

.price-summary {
  background-color: var(--white-color);
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius);
  padding: 25px;
  margin-top: auto; 
  box-shadow: 0 4px 20px rgba(217, 119, 6, 0.1); 
}

.price-summary h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 20px;
  text-align: center;
}

.price-item, .price-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 1rem;
}

.price-total {
  font-size: 1.5rem; 
  font-weight: 700;
  color: var(--primary-color);
  margin-top: 15px;
}
.price-total strong:first-child {
  font-size: 1.2rem;
  font-weight: 600;
}

.divider {
  border: none;
  border-top: 1px dashed var(--text-color);
  opacity: 0.3;
  margin: 15px 0;
}

.note {
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-top: 20px;
  text-align: center;
  line-height: 1.5;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.btn-order {
  flex: 2;
}
.btn-secondary {
  flex: 1;
  background-color: var(--secondary-color);
  color: var(--white-color);
}
.btn-secondary:hover {
  background-color: var(--text-color);
  box-shadow: none;
  transform: none;
}

.search-results-container {
  width: 100%;
}

.search-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.search-grid-header h2 {
  font-size: 1.8rem;
  color: var(--secondary-color);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
}

.search-item-card {
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: all var(--transition-speed) ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--light-gray-color);
  position: relative;
}

.search-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: var(--border-radius);
  transition: opacity 0.2s ease;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(31, 41, 55, 0.7); 
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white; 
  font-size: 1.2rem;
}

.loading-overlay :deep(p) {
  color: white !important;
}
.loading-overlay :deep(.spinner) {
  border-top-color: white !important;
}

.card-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #f9f9f9;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #dc2626;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-content {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8em;
}

.card-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-top: auto; 
}

.loading-container {
  text-align: center;
  padding: 20px;
  color: var(--text-color);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.error-message {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  padding: 15px;
  border-radius: var(--border-radius);
  text-align: center;
  margin-top: 20px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.checkout-modal {
  background-color: var(--white-color);
  padding: clamp(20px, 4vw, 30px);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  transition: all 0.3s ease;
  transform: scale(1);
  max-height: 95%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--light-gray-color);
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 600;
  color: var(--secondary-color); 
}

.modal-body .summary {
  font-size: 1rem;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed var(--text-color);
}

.modal-body .summary p {
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  color: var(--text-color);
  line-height: 1.5;
  margin-bottom: 5px;
}

.summary strong {
  color: var(--secondary-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 8px;
}

.form-input,
textarea.form-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 1rem;
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  background-color: var(--white-color);
  color: var(--text-color);
  transition: all var(--transition-speed) ease;
}

.form-input:focus,
textarea.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.3);
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  cursor: pointer;
}
.radio-label input[type="radio"] {
  accent-color: var(--primary-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

/* ===== THÊM STYLE CHO MÃ QR ===== */
.qr-code-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
  border: 1px solid var(--light-gray-color);
}

.qr-code-image {
  width: 100%;
  max-width: 250px; /* Kích thước phù hợp, không quá to */
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--light-gray-color);
}

.qr-code-note {
  margin-top: 15px;
  font-size: 0.9rem;
  font-style: italic;
  color: var(--secondary-color);
  text-align: center;
  line-height: 1.5;
}

/* Hiệu ứng fade-in */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
/* ===== KẾT THÚC STYLE MỚI ===== */


@media (max-width: 768px) {
  .proxy-order-page {
    padding-top: 20px;
  }
  .input-card {
    padding: 20px;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .page-description {
    font-size: 0.95rem;
    margin-bottom: 25px;
  }
  .url-input {
    padding: 12px 15px;
    font-size: 0.95rem;
  }

  .product-display {
    padding: 20px;
    gap: 25px;
  }
  .product-info .product-name {
    font-size: 1.7rem;
    margin-bottom: 15px;
  }
  .thumbnail-list {
    grid-template-columns: repeat(4, 1fr);
  }
  .spec-item {
    padding: 12px 15px;
    font-size: 1rem;
  }
  .actions {
    margin-bottom: 20px;
  }
  .quantity-selector {
    height: 48px;
    border: 1px solid var(--light-gray-color);
  }
  .quantity-selector input {
    width: 100%;
    flex-grow: 1;
    border: none;
  }
  .quantity-selector button {
    width: 50px;
    flex-shrink: 0;
  }
  .product-description p {
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .price-summary {
    padding: 20px;
  }
  .price-summary h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  .price-item, .price-total {
    font-size: 0.95rem;
  }
  .price-total {
    font-size: 1.3rem;
  }
  .price-total strong:first-child {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
  }
  .note {
    font-size: 0.8rem;
  }
  .action-buttons {
    flex-direction: column;
  }
  .btn-order {
    flex: 1;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  .search-grid-header {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }
  .search-grid-header h2 {
    font-size: 1.5rem;
  }
}
</style>
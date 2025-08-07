<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { get_productID_api, get_products_api } from '@/services/product';
import { submit_order_api } from '@/services/order';
import { formatPrice } from '@/composables/useUtils';
import { useNotification } from '@/composables/useNotification';
import ProductCard from '@/components/product/Card.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const route = useRoute();
const { showNotification } = useNotification();

const product = ref(null);
const allproducts = ref([])

const isLoading = ref(true);
const isSubmitting = ref(false)

const quantity = ref(1);
const mainImage = ref('');
const isCheckoutModalOpen = ref(false);
const customerInfo = ref({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod',
});

const incrementQuantity = () => quantity.value++;
const decrementQuantity = () => {
    if (quantity.value > 1) quantity.value--;
};

const openCheckoutModal = () => { isCheckoutModalOpen.value = true; };
const closeCheckoutModal = () => { isCheckoutModalOpen.value = false; };

const resetForm = () => {
    customerInfo.value = {
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'cod',
    };
    quantity.value = 1;
};

const submitOrder = async () => {
    isSubmitting.value = true
    const orderPayload = {
        productName: product.value.name,
        quantity: quantity.value,
        totalPrice: product.value.price * quantity.value,
        customerName: customerInfo.value.name,
        customerPhone: customerInfo.value.phone,
        customerAddress: customerInfo.value.address,
        paymentMethod: customerInfo.value.paymentMethod,
    };

    try {
        await submit_order_api(orderPayload);
        showNotification('Đặt hàng thành công! Chúng tôi sẽ sớm liên hệ với bạn để xác nhận.')
        closeCheckoutModal();
        resetForm();
    } catch (err) {
        console.error("Failed to submit order:", err);
        showNotification('Gửi đơn hàng thất bại. Vui lòng thử lại.', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

const fetchProductData = async (productId) => {
    if (!productId) {
        isLoading.value = false;
        return;
    }
    isLoading.value = true;
    try {
        const [fetchedProduct, fetchedAllProducts] = await Promise.all([
            get_productID_api(productId),
            get_products_api() //Need change after
        ]);
        product.value = fetchedProduct;
        allproducts.value = fetchedAllProducts;

        if (product.value.image_urls?.length > 0) {
            mainImage.value = product.value.image_urls[0];
        }
    } catch (err) {
        console.error("Failed to fetch product data:", err);
        product.value = null;
        showNotification('Không thể tải dữ liệu sản phẩm.', 'error');
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    fetchProductData(route.params.id);
});

watch(() => route.params.id, (newId) => {
    if (newId) {
        window.scrollTo(0, 0);
        fetchProductData(newId);
    }
});

const handleCheckout = () => {
    openCheckoutModal();
};

</script>

<template>
    <LoadingSpinner v-if="isLoading" message="Đang tải..." />
    <div v-else-if="!product" class="page-state">Không tìm thấy sản phẩm.</div>
    <div v-else class="container">
        <main class="main-content-grid">
            <div class="image-gallery">
                <div class="main-image-wrapper">
                    <img :src="mainImage" :alt="product.name" class="img-main" />
                </div>
                <div class="thumbnail-list">
                    <img v-for="image in product.image_urls" :key="image" :src="image"
                        :class="{ active: mainImage === image }" @click="mainImage = image" alt="Thumbnail" />
                </div>
            </div>

            <div class="info-panel">
                <p class="product-brand">{{ product.category_name }}</p>
                <h1 class="product-title">{{ product.name }}</h1>
                <p class="product-price">{{ formatPrice(product.price) }}</p>
                <div class="actions">
                    <div class="quantity-selector">
                        <button @click="decrementQuantity" aria-label="Giảm số lượng">-</button>
                        <input type="text" :value="quantity" readonly aria-label="Số lượng hiện tại" />
                        <button @click="incrementQuantity" aria-label="Tăng số lượng">+</button>
                    </div>
                    <button class="btn-primary" @click="handleCheckout">
                        <i class="fas fa-credit-card"></i> THANH TOÁN
                    </button>
                </div>

                <div class="trust-bar">
                    <div class="trust-item"><i class="fas fa-shield-alt"></i> <span>Hàng chính hãng 100%</span></div>
                    <div class="trust-item"><i class="fas fa-truck-fast"></i> <span>Giao hàng nhanh</span></div>
                    <div class="trust-item"><i class="fas fa-box-open"></i> <span>Đổi trả hàng 7 ngày</span></div>
                </div>
            </div>
        </main>

        <section class="extended-info-grid">
            <div class="description-section">
                <h3>Mô tả chi tiết</h3>
                <p class="pre-line-text">{{ product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' }}</p>
            </div>
        </section>

        <section class="related-products-section">
            <h2>Sản phẩm tương tự</h2> <br>
            <div class="product-grid">
                <ProductCard v-for="productitem in allproducts" :key="productitem.ID" :product="productitem" />
            </div>
        </section>
    </div>

    <teleport to="body">
        <transition name="modal-fade">
            <div v-if="isCheckoutModalOpen" class="checkout-modal-backdrop" @click.self="closeCheckoutModal">
                <div class="checkout-modal">
                    <div class="modal-header">
                        <h3>Thông tin đặt hàng</h3>
                        <button class="close-btn" @click="closeCheckoutModal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <LoadingSpinner v-if="isSubmitting" message="Đang xử lý đơn hàng..." />
                        <div v-else>
                            <div class="order-summary">
                                <p>Sản phẩm: <strong>{{ product.name }}</strong></p>
                                <p>Số lượng: <strong>{{ quantity }}</strong></p>
                                <p>Tổng tiền: <strong>{{ formatPrice(product.price * quantity) }}</strong></p>
                            </div>

                            <form @submit.prevent="submitOrder">
                                <div class="form-group">
                                    <label for="name">Họ và tên</label>
                                    <input id="name" type="text" class="form-input" v-model="customerInfo.name" placeholder="Nhập tên của bạn" required>
                                </div>
                                <div class="form-group">
                                    <label for="phone">Số điện thoại</label>
                                    <input id="phone" type="tel" class="form-input" v-model="customerInfo.phone" placeholder="Nhập số điện thoại của bạn" required>
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
                                            <span>Thanh toán khi nhận hàng</span>
                                        </div>
                                        <div class="radio-label">
                                            <input type="radio"  v-model="customerInfo.paymentMethod"
                                                value="bank_transfer">
                                            <span>Chuyển khoản ngân hàng</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-actions">
                                    <button type="button" class="btn" @click="closeCheckoutModal">Hủy</button>
                                    <button type="submit" class="btn-primary">Xác nhận đặt hàng</button>
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
.container {
    margin: 40px auto;
}

.main-content-grid {
    display: grid;
    grid-template-columns: 7fr 3fr;
    gap: 60px;
    width: 100%;
}

.image-gallery {
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.main-image-wrapper {
    display: flex;
    aspect-ratio: 1 / 0.7;
    background-color: var(--light-gray-color);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.main-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.main-image-wrapper img:hover {
    transform: scale(1.05);
}

.thumbnail-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
}

.thumbnail-list img {
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 8px;
    border: 2px solid var(--border-color);
    cursor: pointer;
    object-fit: cover;
    transition: all 0.2s ease;
}

.thumbnail-list img.active,
.thumbnail-list img:hover {
    border-color: var(--primary-color);
    opacity: 1;
}

.product-brand {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
}

.product-title {
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1.2;
    margin: 0;
}

.product-price {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 24px 0;
}

.info-panel {
    display: flex;
    flex-direction: column;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 32px;
    align-items: center;
}

.quantity-selector {
    display: flex;
    align-items: center;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
}

.quantity-selector input {
    width: 50px;
    height: 48px;
    text-align: center;
    background-color: var(--white-color);
    color: var(--text-color);
    border: none;
    font-size: 1.1rem;
    font-weight: 600;
}

.quantity-selector button {
    background-color: var(--light-gray-color);
    color: var(--text-color);
    border: none;
    width: 40px;
    height: 48px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background-color var(--transition-speed);
}


.quantity-selector button:hover {
    background-color: #d1d5db;
}

.btn-primary {
    flex-grow: 1;
    gap: 10px;
    height: 48px; 
}

.order-summary {
    margin-bottom: 12px;
}

.trust-bar {
    display: flex;
    flex-flow: column;
    gap: 30px;
}

.trust-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-color);
}

.extended-info-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 60px;
    padding-top: 40px;
    border-top: 1px solid var(--border-color);
}

.description-section h3,
.specs-section h3,
.related-products-section h2 {
    font-size: 1.5rem;
    color: var(--text-color);
    margin-bottom: 16px;
}

.description-section p {
    line-height: 1.8;
    color: var(--text-color);
}

.related-products-section {
    padding-top: 32px;
    margin-top: 60px;
    border-top: 1px solid black;
}

@media (max-width: 992px) {
    .main-content-grid {
        grid-template-columns: 1fr;
        gap: 40px;
    }

    .extended-info-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .product-title {
        font-size: 2.2rem;
    }

    .product-price {
        font-size: 2rem;
    }

    .quantity-selector input {
        width: 60px;
        font-size: 1rem;
    }

    .quantity-selector button {
        width: 45px;
        height: 100%;
        font-size: 1.1rem;
    }

    .btn-primary {
        width: 100%;
        height: 45px;
        font-size: 1rem;
        padding: 0;
    }

    .actions {
        flex-wrap: nowrap;
    }
}

@media (max-width: 480px) {
    .actions {
        flex-direction: column;
        flex-wrap: nowrap;
        gap: 10px;
        margin-bottom: 20px;
    }

    .quantity-selector {
        height: 40px;
    }

    .quantity-selector input {
        width: 50px;
        font-size: 0.9rem;
    }

    .quantity-selector button {
        width: 40px;
        font-size: 1rem;
    }

    .btn-primary {
        height: 40px;
        font-size: 0.9rem;
    }
}
</style>
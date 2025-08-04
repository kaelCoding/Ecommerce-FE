<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { get_productID_api, get_products_api } from '@/services/product';
import { submit_order_api } from '@/services/order';

const route = useRoute();

const product = ref(null);
const allproducts = ref([])
const isLoading = ref(true);
const quantity = ref(1);
const mainImage = ref('');
const isCheckoutModalOpen = ref(false);
const customerInfo = ref({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod',
});

const formatPrice = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const incrementQuantity = () => quantity.value++;
const decrementQuantity = () => {
    if (quantity.value > 1) quantity.value--;
};

const openCheckoutModal = () => {
    isCheckoutModalOpen.value = true;
};

const closeCheckoutModal = () => {
    isCheckoutModalOpen.value = false;
};

const submitOrder = async () => {
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
        alert('Đơn hàng của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ để xác nhận.');
        closeCheckoutModal();
        customerInfo.value = {
            name: '',
            phone: '',
            address: '',
            paymentMethod: 'cod',
        };
    } catch (err) {
        console.error("Failed to submit order:", err);
        alert('Gửi đơn hàng thất bại. Vui lòng thử lại.');
    }
};

const getProducts = async () => {
    await get_products_api().then((res) => {
        allproducts.value = res
    })
}

onMounted(async () => {
    const productId = route.params.id;
    if (!productId) {
        isLoading.value = false;
        return;
    }
    try {
        const fetchedProduct = await get_productID_api(productId);
        await getProducts();

        product.value = fetchedProduct;

        if (product.value.image_urls?.length > 0) {
            mainImage.value = product.value.image_urls[0];
        }
    } catch (err) {
        console.error("Failed to fetch product data:", err);
        product.value = null;
    } finally {
        isLoading.value = false;
    }
});

const handleCheckout = () => {
    openCheckoutModal(); 
};

</script>

<template>
    <div v-if="isLoading" class="page-state">Đang tải...</div>
    <div v-else-if="!product" class="page-state">Không tìm thấy sản phẩm.</div>
    <div v-else class="product-page-container">
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
                    <button class="checkout-btn" @click="handleCheckout">
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

        <!-- <section class="related-products-section">
            <h2>Sản phẩm tương tự</h2>
            <div class="related-products-grid">
                <div v-for="related in allproducts" :key="related.ID" class="product-card">
                    <img :src="related.image_urls[0]" :alt="related.name" />
                    <h4>{{ related.name }}</h4>
                    <p>{{ related.price }} đ</p>
                </div>
            </div>
        </section> -->
    </div>

    <teleport to="body">
        <transition name="modal-fade">
            <div v-if="isCheckoutModalOpen" class="checkout-modal-backdrop" @click.self="closeCheckoutModal">
                <div class="checkout-modal">
                    <div class="modal-header">
                        <h3>Thông tin đặt hàng</h3>
                        <button class="close-btn" @click="closeCheckoutModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="summary">Sản phẩm: **{{ product.name }}**</p>
                        <p class="summary">Số lượng: **{{ quantity }}**</p>
                        <p class="summary">Tổng tiền: **{{ formatPrice(product.price * quantity) }}**</p>

                        <form @submit.prevent="submitOrder">
                            <div class="form-group">
                                <label for="name">Họ và tên</label>
                                <input id="name" type="text" v-model="customerInfo.name" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Số điện thoại</label>
                                <input id="phone" type="tel" v-model="customerInfo.phone" required>
                            </div>
                            <div class="form-group">
                                <label for="address">Địa chỉ</label>
                                <textarea id="address" v-model="customerInfo.address" required></textarea>
                            </div>

                            <div class="form-group">
                                <label>Phương thức thanh toán</label>
                                <div class="payment-options">
                                    <div class="radio-label">
                                        <input type="radio" v-model="customerInfo.paymentMethod" value="cod">
                                        <span>Thanh toán khi nhận hàng</span>
                                    </div>
                                    <div class="radio-label">
                                        <input type="radio" v-model="customerInfo.paymentMethod" value="bank_transfer">
                                        <span>Chuyển khoản ngân hàng</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn-cancel" @click="closeCheckoutModal">Hủy</button>
                                <button type="submit" class="btn-submit">Đặt hàng</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<style scoped>
:root {
    --primary-color: #007bff;
    --text-dark: #1a1a1a;
    --text-light: #666;
    --bg-light: #f8f9fa;
    --border-color: #e9ecef;
}

.product-page-container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: 'Inter', sans-serif;
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

/* PANEL THÔNG TIN */
.info-panel {
    display: flex;
    flex-direction: column;
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

.social-proof {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    font-size: 0.9rem;
    color: var(--text-light);
}

.social-proof .rating .fa-star {
    color: #fdd835;
}

.product-price {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 24px 0;
}

.actions {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
}

.quantity-selector {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: 8px;
}

.quantity-selector input {
    width: 50px;
    text-align: center;
    border: none;
    font-size: 1.1rem;
    font-weight: 600;
}

.quantity-selector button {
    background: none;
    border: none;
    width: 40px;
    height: 48px;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-light);
}

.checkout-btn {
    flex-grow: 1;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 50px;
}

.checkout-btn:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.trust-bar {
    display: flex;
    justify-content: space-around;
    gap: 16px;
    background-color: var(--bg-light);
    padding: 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text-dark);
}

.trust-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.trust-item .fas {
    color: var(--primary-color);
}

.extended-info-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 60px;
    padding-top: 60px;
    border-top: 1px solid var(--border-color);
}

.description-section h3,
.specs-section h3,
.related-products-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 16px;
}

.description-section p {
    line-height: 1.8;
    color: var(--text-light);
}

.specs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.specs-table td {
    padding: 12px;
    border-bottom: 1px solid var(--border-color);
}

.specs-table tr:last-child td {
    border-bottom: none;
}

.specs-table td:first-child {
    font-weight: 600;
    color: var(--text-dark);
    width: 40%;
}

.specs-table td:last-child {
    color: var(--text-light);
}

.related-products-section {
    padding-top: 60px;
    margin-top: 60px;
    border-top: 1px solid var(--border-color);
}

.related-products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}

.product-card {
    border: 1px solid transparent;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border-color: var(--border-color);
}

.product-card img {
    width: 100%;
    aspect-ratio: 1/1;
    background-color: var(--bg-light);
    object-fit: cover;
}

.product-card h4,
.product-card p {
    margin: 0;
    padding: 4px 16px;
}

.product-card h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-top: 12px;
}

.product-card p {
    font-size: 1rem;
    color: var(--primary-color);
    font-weight: 500;
    margin-bottom: 16px;
}

/* RESPONSIVE */
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
    .related-products-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .product-title {
        font-size: 2.2rem;
    }

    .product-price {
        font-size: 2rem;
    }

    .quantity-selector {
        width: 100%;
        justify-content: center;
        height: 45px;
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

    .checkout-btn {
        width: 100%;
        height: 45px;
        font-size: 1rem;
        padding: 0;
    }
}

@media (max-width: 480px) {
    .actions {
        flex-direction: column;
        gap: 15px;
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

    .checkout-btn {
        height: 40px;
        font-size: 0.9rem;
    }
}

.page-state {
    text-align: center;
    padding: 80px 20px;
    font-size: 1.2rem;
    color: var(--text-light);
}
</style>
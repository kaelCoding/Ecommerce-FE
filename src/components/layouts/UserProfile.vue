<script setup>
import { ref, onMounted, computed } from 'vue';
import { get_auth_info, get_auth_user } from '@/stores/auth';
import { formatPrice } from '@/composables/useUtils';
import LoadingSpinner from '../common/LoadingSpinner.vue';

const isLoading = ref(true);
const errorMessage = ref('');
const isRulesVisible = ref(false);

const vipThresholds = {
    1: 1000000,
    2: 2500000,
    3: 5000000,
    4: 8000000,
};

const progressPercentage = computed(() => {
    if (!get_auth_user.value || get_auth_user.value.vipLevel >= 4) {
        return 100;
    }
    const currentLevel = get_auth_user.value.vipLevel;
    const nextLevel = currentLevel + 1;
    const totalSpent = get_auth_user.value.totalSpent;
    if (currentLevel === 0) {
        const nextLevelThreshold = vipThresholds[nextLevel];
        return Math.min(100, (totalSpent / nextLevelThreshold) * 100);
    }
    const currentLevelThreshold = vipThresholds[currentLevel];
    const nextLevelThreshold = vipThresholds[nextLevel];
    const range = nextLevelThreshold - currentLevelThreshold;
    const progressInLevel = totalSpent - currentLevelThreshold;
    return Math.min(100, (progressInLevel / range) * 100);
});

const hasFreeship = computed(() => {
    const vipLevel = get_auth_user.value?.vipLevel;
    return vipLevel >= 2;
});

onMounted(async () => {
    try {
        await get_auth_info();
    } catch (err) {
        console.error("Failed to fetch user info:", err);
        errorMessage.value = "Không thể tải thông tin người dùng. Vui lòng thử lại.";
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="user-profile-page container">
        <LoadingSpinner v-if="isLoading" message="Đang tải dữ liệu..." />
        <div v-else class="profile-layout">
            <aside class="profile-sidebar">
                <div class="profile-card user-info-card">
                    <div class="profile-ctn">
                        <i class="fa-solid fa-circle-user profile-icon"></i>
                        <div>
                            <h1 class="username">{{ get_auth_user?.username }}</h1>
                            <p class="email">{{ get_auth_user?.email }}</p>
                        </div>
                    </div>
                    <div class="divider"></div>
                    <div class="overview-section">
                        <h2 class="section-title">Tổng quan</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Tổng chi tiêu</span>
                                <span class="info-value">{{ formatPrice(get_auth_user?.totalSpent)
                                }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Mức giảm giá</span>
                                <span class="info-value">{{ (get_auth_user?.discountPercentage *
                                    100).toFixed(0) }}%</span>
                            </div>
                            <div v-if="hasFreeship" class="freeship-tag">
                                <i class="fa-solid fa-truck"></i>
                                <span>Freeship</span>
                            </div>
                        </div> <br>
                        <RouterLink to="/lucky-spin" class="btn-primary">Vòng quay may mắn</RouterLink>
                    </div>
                </div>
            </aside>

            <main class="loyalty-content">
                <div class="profile-card vip-card">
                    <div class="vip-card-header">
                        <div class="vip-level">
                            <i class="fa-solid fa-crown"></i>
                            <span>VIP {{ get_auth_user?.vipLevel }}</span>
                        </div>
                        <p class="current-level-text">
                            {{ get_auth_user?.vipLevel === 4 ? "Cấp bậc Vĩnh Viễn" : "Cấp bậc hiện tại" }}
                        </p>
                    </div>

                    <div v-if="get_auth_user?.vipLevel < 4" class="progress-section">
                        <div class="progress-header">
                            <span class="progress-title">Lên VIP {{ get_auth_user?.vipLevel + 1 }}</span>
                            <span class="progress-percentage">{{ Math.round(progressPercentage) }}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
                        </div>
                        <p class="progress-remaining-text">
                            Chi tiêu thêm {{ formatPrice(get_auth_user?.nextLevelRequirement) }} để thăng hạng.
                        </p>
                    </div>
                    <div v-else class="permanent-vip-message">
                        <p>Bạn đã đạt cấp bậc cao nhất. Cảm ơn bạn đã đồng hành cùng TUNI TOKU!</p>
                    </div>
                </div>

                <div v-if="get_auth_user?.vipLevel > 0 && get_auth_user?.vipLevel < 4"
                    class="profile-card maintenance-card">
                    <h3 class="section-title">Duy trì cấp bậc</h3>
                    <div class="maintenance-info">
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-clock"></i> Ngày hết hạn</span>
                            <span class="info-value">{{ new Date(get_auth_user?.vipExpiryDate).toLocaleDateString()
                            }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-bullseye"></i> Cần chi tiêu</span>
                            <span class="info-value text-red-500 font-bold">{{
                                formatPrice(get_auth_user?.maintenanceRequirement) }}</span>
                        </div>
                    </div>
                </div>

                <div class="profile-card rules-accordion">
                    <button @click="isRulesVisible = !isRulesVisible" class="accordion-button">
                        <h3 class="section-title">Thể lệ</h3>
                        <i class="fa-solid fa-chevron-down" :class="{ 'rotate-180': isRulesVisible }"></i>
                    </button>
                    <div v-if="isRulesVisible" class="rules-container">
                        <div class="rules-section">
                            <h3>1. Các Cấp Bậc VIP & Quyền Lợi</h3>
                            <p>Hành trình của bạn sẽ đi qua 4 cấp bậc, mỗi cấp độ sẽ mang lại một mức chiết khấu vĩnh
                                viễn trên mọi đơn hàng.</p>
                            <ul class="vip-list">
                                <li>
                                    <strong>VIP 1</strong>
                                    <ul>
                                        <li><strong>Đạt được khi:</strong> Tổng chi tiêu tích lũy đạt 1 triệu VNĐ.</li>
                                        <li><strong>Quyền lợi:</strong> Giảm 2% trên mọi đơn hàng.</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>VIP 2</strong>
                                    <ul>
                                        <li><strong>Đạt được khi:</strong> Tổng chi tiêu tích lũy đạt 2,5 triệu VNĐ.</li>
                                        <li><strong>Quyền lợi:</strong> Giảm 3% trên mọi đơn hàng + Freeship.</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>VIP 3</strong>
                                    <ul>
                                        <li><strong>Đạt được khi:</strong> Tổng chi tiêu tích lũy đạt 5 triệu VNĐ.</li>
                                        <li><strong>Quyền lợi:</strong> Giảm 5% trên mọi đơn hàng + Freeship.</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>VIP 4 (Vĩnh Viễn)</strong>
                                    <ul>
                                        <li><strong>Đạt được khi:</strong> Tổng chi tiêu tích lũy đạt 8 triệu VNĐ.</li>
                                        <li><strong>Quyền lợi:</strong> Giảm 7% trên mọi đơn hàng trọn đời! + Freeship.</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <hr class="rules-divider" />
                        <div class="rules-section">
                            <h3>2. Quy Tắc Duy Trì Cấp Bậc</h3>
                            <p>Để đảm bảo bạn luôn nhận được những ưu đãi tốt nhất, các cấp bậc VIP 1, 2 và 3 có một quy
                                tắc duy trì đơn giản:</p>
                            <ul class="maintenance-list">
                                <li><strong>Thời hạn duy trì:</strong> Kể từ khi bạn đạt một cấp VIP mới, bạn sẽ có 3
                                    tháng để duy trì cấp bậc đó.</li>
                                <li><strong>Yêu cầu duy trì:</strong> Trong vòng 3 tháng này, bạn chỉ cần chi tiêu một
                                    khoản tiền bằng 30% giá trị ban đầu của cấp bậc đó. Khi bạn hoàn thành yêu cầu này,
                                    cấp bậc của bạn sẽ được duy trì thêm 3 tháng nữa.
                                    <ul>
                                        <li><em>Ví dụ:</em> Khi bạn đạt VIP 1 (với 1 triệu VNĐ), bạn chỉ cần chi tiêu
                                            thêm 300.000 VNĐ trong 3 tháng để duy trì cấp VIP 1.</li>
                                        <li>Khi bạn đạt VIP 2 (với 2.5 triệu VNĐ), bạn chỉ cần chi tiêu thêm 750.000 VNĐ
                                            trong 3 tháng để duy trì cấp VIP 2.</li>
                                    </ul>
                                </li>
                                <li><strong>Thăng hạng tự động:</strong> Nếu trong 3 tháng này, bạn chi tiêu đủ số tiền
                                    của cấp tiếp theo, bạn sẽ được thăng hạng ngay lập tức và chu kỳ 3 tháng mới sẽ bắt
                                    đầu.</li>
                                <li><strong>Hạ cấp:</strong> Nếu không đạt đủ yêu cầu duy trì, bạn sẽ trở về cấp bậc
                                    trước đó.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>
<style scoped>
.user-profile-page {
    padding-top: 4rem;
    padding-bottom: 4rem;
    animation: fadeInUp 0.5s ease-out forwards;
}

.profile-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

.profile-ctn {
    display: flex;
}

@media (min-width: 1024px) {
    .profile-layout {
        grid-template-columns: 320px 1fr;
    }
}

.profile-card {
    background-color: var(--white-color);
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
}

.profile-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

html[data-theme="dark"] .profile-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.divider {
    border-top: 1px solid var(--light-gray-color);
    margin: 1.5rem 0;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--secondary-color);
    margin-bottom: 0.5rem;
}

.fa-chevron-down {
    color: var(--secondary-color);
}

.user-info-card .profile-icon {
    font-size: 3.5rem;
    color: var(--primary-color);
}

.user-info-card .username {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--secondary-color);
}

.user-info-card .email {
    font-size: 0.875rem;
    color: var(--text-color);
}

.info-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.info-item {
    display: flex;
    flex-direction: column;
    flex-basis: 45%;
}

.info-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.25rem;
}

html[data-theme="dark"] .info-label {
    color: #cbd5e0;
}

.info-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-color);
}

.discount-value {
    color: var(--primary-color);
    font-size: 1rem;
}

.freeship-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #d1fae5;
    color: #065f46;
    border-radius: 9999px;
    width: fit-content;
    font-size: 0.875rem;
    margin-top: 1rem;
}

html[data-theme="dark"] .freeship-tag {
    background-color: #10b981;
    color: #ecfdf5;
}

.loyalty-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.vip-card {
    background: linear-gradient(135deg, var(--primary-color), #2563eb);
    color: var(--white-color);
    padding: 2rem;
}

.vip-card-header {
    text-align: center;
    margin-bottom: 2rem;
}

.vip-level {
    font-size: 2.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--white-color);
}

.vip-level .fa-crown {
    font-size: 2.25rem;
}

.current-level-text {
    font-size: 1rem;
    opacity: 0.9;
    color: var(--white-color);
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-weight: 500;
    color: var(--white-color);
}

.progress-bar-container {
    width: 100%;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background-color: var(--white-color);
    transition: width 0.5s ease-in-out;
    border-radius: 9999px;
}

.progress-remaining-text {
    font-size: 0.875rem;
    text-align: center;
    margin-top: 0.75rem;
    opacity: 0.9;
    color: var(--white-color);
}

.permanent-vip-message {
    text-align: center;
    font-weight: 500;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius);
    color: var(--white-color);
}

.maintenance-card {
    background-color: var(--light-gray-color);
}

.maintenance-card .section-title {
    margin-bottom: 1rem;
}

.maintenance-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.maintenance-info .info-item {
    background-color: var(--white-color);
    padding: 1rem;
    border-radius: var(--border-radius);
    flex: 1;
}

.rules-accordion .accordion-button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

.rules-accordion .section-title {
    margin: 0;
}

.rules-accordion .accordion-button i {
    transition: transform var(--transition-speed) ease;
}

.rules-accordion .accordion-button i.rotate-180 {
    transform: rotate(180deg);
}

.rules-content {
    padding: 1rem;
}

.program-text {
    font-size: 0.9rem;
    color: var(--text-color);
    line-height: 1.8;
}

.program-text h3 {
    font-weight: 700;
    font-size: 1.125rem;
    color: var(--secondary-color);
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
}

.program-text li {
    margin-left: 2rem;
}

.rules-container {
    background-color: var(--white-color);
    font-family: Arial, sans-serif;
    line-height: 1.6;
}

.rules-section {
    margin-bottom: 2rem;
}

.rules-section h3 {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
    border-left: 4px solid var(--primary-color);
    padding-left: 1rem;
    margin-bottom: 1rem;
}

.rules-section p {
    margin-bottom: 1rem;
}

.vip-list,
.maintenance-list {
    list-style: none;
    padding: 0;
}

.vip-list>li {
    background-color: var(--light-gray-color);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.vip-list>li:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.vip-list strong {
    font-size: 1rem;
    color: var(--secondary-color);
}

.vip-list ul {
    margin-top: 0.5rem;
    padding-left: 1.5rem;
    list-style-type: disc;
}

.maintenance-list {
    margin-left: 1rem;
}

.maintenance-list li {
    margin-bottom: 0.75rem;
}

.rules-divider {
    border: 0;
    height: 1px;
    background-color: #cbd5e0;
    margin: 2rem 0;
}
</style>
<template>
    <footer class="main-footer">
        <div class="container footer-content">
            <div class="footer-column about-us">
                <a href="https://www.facebook.com/W.A.T.St0re" target="_blank" class="social-links">
                    <h3>Tuni Toku</h3>
                </a>
                <p class="footer-text">
                   Tuni Toku là điểm đến của những người hâm mộ Tokusatsu. Chúng tôi chuyên cung cấp mô hình và đồ chơi chính hãng, chất lượng cao, an toàn và đa dạng. Cùng Tuni Toku thỏa mãn đam mê sưu tầm và khám phá thế giới siêu anh hùng!
                </p>
            </div>

            <div class="footer-column contact-info">
                <h3 class="footer-heading">Hỗ trợ & Liên hệ</h3>
                <a href="https://www.facebook.com/W.A.T.St0re" target="_blank">
                    <p class="footer-text">
                        <i class="fa-brands fa-facebook-f"></i> Tuni Toku
                    </p>
                </a>
                <p class="footer-text">
                    <i class="fas fa-phone"></i> 0869553209
                </p> 
                <p class="footer-text">
                    <i class="fas fa-envelope"></i> hdtt1504@gmail.com
                </p>
            </div>

            <div class="footer-column quick-links">
                <h3 class="footer-heading">Liên kết nhanh</h3>
                <router-link class="footer-text" to="/">Trang chủ</router-link>
                <router-link class="footer-text" to="/products">Sản phẩm</router-link>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="container">
                <p>&copy; 2025 KAEL.</p>
                <p>All Rights Reserved.</p>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.main-footer {
    background-color: var(--secondary-color);
    color: #ccc;
    padding: 60px 60px 20px 60px;
    border-top: 5px solid var(--secondary-color);
}

h3, a {
    width: max-content;
}

.footer-column {
    display: flex;
    flex-flow: column;
    align-items: center;
}

.footer-content {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 30px;
    margin-bottom: 40px;
}

.footer-heading {
    font-size: 1.2rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 20px;
}

.footer-text {
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: color var(--transition-speed);
    display: inline-block;
}

a:hover {
    color: var(--primary-color);
}

.social-links {
    display: flex;
    color: #ffffff;
    margin-bottom: 20px;
    font-size: 1.2rem;
    font-weight: 600;
    transition: color var(--transition-speed);
}

.footer-bottom {
    border-top: 1px solid #444;
    padding-top: 20px;
    text-align: center;
    font-size: 0.9rem;
    color: #888;
}

@media (max-width: 768px) {
    .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 20px;
    }

    .quick-links,
    .about-us,
    .contact-info {
        text-align: left;
    }

    .social-links {
        justify-content: flex-start;
    }

    .footer-text {
        justify-content: flex-start;
    }
}

@media (max-width: 576px) {
    .quick-links,
    .about-us,
    .contact-info {
        text-align: center;
    }

    .social-links {
        justify-content: center;
    }

    .footer-text {
        justify-content: center;
    }
}
</style>
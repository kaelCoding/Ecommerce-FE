<template>
    <footer class="main-footer">
        <div class="container footer-content">
            <div id="about-us" class="footer-column about-us">
                <h3 class="footer-heading">TONI TOKU</h3>
                <p class="footer-text">
                    Chuyên cung mô hình cấp đồ chơi chất lượng cao, an toàn và đa dạng cho mọi lứa tuổi.
                </p>
                <div class="social-links">
                    <a href="https://www.facebook.com/tungthanh.1504" target="_blank" class="social-icon"><i
                            class="fab fa-facebook-f"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
                </div>
            </div>

            <div id="contact" class="footer-column contact-info">
                <h3 class="footer-heading">Liên hệ</h3>
                <p class="footer-text">
                    <i class="fas fa-map-marker-alt"></i> Quận Ngũ Hành Sơn, TP Đà Nẵng
                </p>
                <p class="footer-text">
                    <i class="fas fa-phone"></i> +84 869553209
                </p>
                <p class="footer-text">
                    <i class="fas fa-envelope"></i> hdtt1504@gmail.com
                </p>
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

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.footer-heading {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--white-color);
    margin-bottom: 20px;
}

.footer-text {
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.footer-links {
    list-style: none;
    padding: 0;
}

.footer-links li a {
    color: #ccc;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color var(--transition-speed);
    line-height: 2.2;
}

.footer-links li a:hover {
    color: var(--primary-color);
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-icon {
    color: #ccc;
    font-size: 1.2rem;
    transition: color var(--transition-speed);
}

.social-icon:hover {
    color: var(--primary-color);
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
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        text-align: left;
        gap: 20px;
    }

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
    .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 30px;
    }

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
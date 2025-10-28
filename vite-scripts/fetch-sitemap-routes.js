import fetch from 'node-fetch';

const API_BASE_URL = "http://localhost:8080";
// const API_BASE_URL = "https://ecommerce-be-production-856c.up.railway.app";
const API_PREFIX = "/api/v1";

async function fetchData(path) {
    const url = `${API_BASE_URL}${API_PREFIX}${path}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API response error for ${path}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu từ ${path}:`, error);
        return [];
    }
}

export default async function fetchSitemapRoutes() {
    console.log("🚀 Bắt đầu lấy dữ liệu để xây dựng sitemap nâng cao...");
    const products = await fetchData('/sitemap/products');
    const productRoutes = products.map(product => `/products/detail/${product.id}`);
    
    console.log(`✅ Lấy thành công ${productRoutes.length} route sản phẩm.`);
    console.log("🎉 Xây dựng sitemap hoàn tất!");

    return productRoutes; 
}
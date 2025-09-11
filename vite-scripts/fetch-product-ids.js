import fetch from 'node-fetch';

// const API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = "https://ecommerce-be-production-856c.up.railway.app";
const API_PREFIX = "/api/v1";

async function fetchAllProductIds() {
    console.log("Đang lấy ID sản phẩm từ backend cho sitemap...");
    const url = `${API_BASE_URL}${API_PREFIX}/products/ids`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API response error: ${response.statusText}`);
        }

        const ids = await response.json();
        console.log(`Đã lấy thành công ${ids.length} ID sản phẩm.`);
        return ids;
    } catch (error) {
        console.error("Lỗi khi lấy ID sản phẩm cho sitemap:", error);
        return [];
    }
}

export default fetchAllProductIds;

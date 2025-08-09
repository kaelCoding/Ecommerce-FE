import { api, apiFormData } from "@/models/api";

export const add_product_api = async (formData) => {
    try {
        return await apiFormData("POST", "/api/v1/admin/products", formData);
    } catch (error) {
        throw error;
    }
}

export const get_products_api = async () => {
    try {
        return await api("GET", "/api/v1/products")
    } catch (error) {
        throw error
    }
}

export const get_productID_api = async (id) => {
    try {
        return await api("GET", `/api/v1/products/${id}`)
    } catch (error) {
        throw error
    }
}

export const update_product_api = async (id, data) => {
    try {
        return await apiFormData("PUT", `/api/v1/admin/products/${id}`, data)
    } catch (error) {
        throw error
    }
}

export const delete_product_api = async (id) => {
    try {
        return await api("DELETE", `/api/v1/admin/products/${id}`)
    } catch (error) {
        throw error
    }
}

export const searchProductsAPI = async (query) => {
    if (!query) {
        return [];
    }
    const url = `/api/v1/products/search?q=${encodeURIComponent(query)}`;
    try {
        return await api("GET", url); 
    } catch (error) {
        throw error
    }
}
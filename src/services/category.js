import { api } from "@/models/api";

export const add_category_api = async (data) => {
    try {
        return await api("POST", "/api/v1/admin/categories", data)
    } catch (error) {
        throw error
    }
}

export const get_categories_api = async () => {
    try {
        return await api("GET", "/api/v1/categories")
    } catch (error) {
        throw error
    }
}

export const get_categoryID_api = async (id) => {
    try {
        return await api("GET", `/api/v1/categories/${id}`)
    } catch (error) {
        throw error
    }
}

export const update_category_api = async (id, data) => {
    try {
        return await api("PUT", `/api/v1/admin/categories/${id}`, data)
    } catch (error) {
        throw error
    }
}

export const delete_category_api = async (id) => {
    try {
        return await api("DELETE", `/api/v1/admin/categories/${id}`)
    } catch (error) {
        throw error
    }
}

export const get_products_by_category_api = async (categoryId) => {
    try {
        return await api("GET", `/api/v1/categories/${categoryId}/products`);
    } catch (error) {
        throw error;
    }
};
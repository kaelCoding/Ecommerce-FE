import { api } from "@/models/api";

export const getCartAPI = async () => {
    try {
        return await api("GET", '/cart');        
    } catch (error) {
        throw error;
    }
};

export const addToCartAPI = async (payload) => {
    try {
        return await api("POST", '/cart', payload);        
    } catch (error) {
        throw error;
    }
};

export const updateCartItemAPI = async (itemId, quantity) => {
    try {
        return await api("PUT", `/cart/items/${itemId}`, { quantity });        
    } catch (error) {
        throw error;
    }
};

export const deleteCartItemAPI = async (itemId) => {
    try {
        return await api("DELETE", `/cart/items/${itemId}`);        
    } catch (error) {
        throw error;
    }
};


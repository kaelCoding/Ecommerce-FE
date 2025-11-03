import { api } from "@/models/api";

export const checkoutFromCartAPI = async (payload) => {
    try {
        return await api("POST", '/cart/checkout', payload);
    } catch (error) {
        throw error;
    }
};

export const send_feedback_api = async (feedbackData) => {
    try {
        return await api("POST", "/feedback", feedbackData);
    } catch (error) {
        throw error;
    }
};

export const submitGenericOrderAPI = async (payload) => {
    try {
        return await api("POST", '/orders', payload);
    } catch (error) {
        throw error;
    }
};

export const submitProxyOrderAPI = async (payload) => {
    try {
        return await api("POST", '/proxy/order', payload);
    } catch (error) {
        throw error
    }
};

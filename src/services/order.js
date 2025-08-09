import { api } from "@/models/api";

export const submit_order_api = async (orderData) => {
    try {
        return await api("POST", "/api/v1/orders", orderData);
    } catch (error) {
        throw error;
    }
};

export const send_feedback_api = async (feedbackData) => {
    try {
        return await api("POST", "/api/v1/feedback", feedbackData);
    } catch (error) {
        throw error;
    }
};
import { api } from "@/models/api";

export const submit_order_api = async (orderData) => {
    try {
        return await api("POST", "/orders", orderData);
    } catch (error) {
        throw error;
    }
};
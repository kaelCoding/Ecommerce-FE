import { api } from "@/models/api";

export const get_dashboard_stats_api = async () => {
    try {
        return await api("GET", "/admin/stats");
    } catch (error) {
        throw error;
    }
};

export const getAllOrdersApi = async () => {
    try {
        return await api("GET", "/admin/orders");
    } catch (error) {
        throw error;
    }
};

export const updateShippingCodeApi = async (orderId, shippingCode) => {
    try {
        return await api("PUT", `/admin/orders/${orderId}/shipping-code`, { shippingCode });
    } catch (error) {
        throw error;
    }
};

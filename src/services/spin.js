import { api } from "@/models/api";

export const spinByShippingCodeApi = async (shippingCode) => {
    try {
        return await api("POST", "/spin", { shippingCode });
    } catch (error) {
        throw error;
    }
};

export const getRewardsApi = async () => {
    try {
        return await api("GET", "/rewards");
    } catch (error) {
        throw error;
    }
};

export const addRewardApi = async (rewardData) => {
    try {
        return await api("POST", "/admin/rewards", rewardData);
    } catch (error) {
        throw error;
    }
};

export const updateRewardApi = async (rewardId, rewardData) => {
    try {
        return await api("PUT", `/admin/rewards/${rewardId}`, rewardData);
    } catch (error) {
        throw error;
    }
};

export const deleteRewardApi = async (rewardId) => {
    try {
        return await api("DELETE", `/admin/rewards/${rewardId}`);
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
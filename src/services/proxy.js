import { api } from "@/models/api";

export const fetchMercariProductAPI = async (url) => {
    try {
        return await api("POST", "/proxy/fetch", { url });
    } catch (error) {
        throw error;
    }
}

export const searchMercariAPI = async (keyword) => {
    try {
        return await api("POST", "/proxy/search", { keyword });
    } catch (error) {
        throw error;
    }
}
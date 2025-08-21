import { api } from "@/models/api";

export const get_dashboard_stats_api = async () => {
    try {
        return await api("GET", "/admin/stats");
    } catch (error) {
        throw error;
    }
};

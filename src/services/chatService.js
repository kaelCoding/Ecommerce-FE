import { api } from "@/models/api";

export const getChatHistory = async (userId = null) => {
    try {
        let url = '/chat/history';
        if (userId) {
            url += `?userId=${userId}`;
        }
        
        return await api('GET', url);
    } catch (error) {
        throw error
    }
};
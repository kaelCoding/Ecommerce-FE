import { api } from '@/models/api';

export const updateFCMToken = async (token) => {
    try {
        return await api('POST', '/fcm/token', { token });
    } catch (error) {
        throw error;
    }
};

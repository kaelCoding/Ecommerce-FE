
import { api } from "@/models/api";

export const auth_login_api = async (data) => {
    try {
        return await api("POST", "/api/v1/auth/login", data)
    } catch (error) {
        throw error
    }
}

export const auth_register_api = async (data) => {
    try {
        return await api("POST", "/api/v1/auth/register", data)
    } catch (error) {
        throw error
    }
}

export const auth_info_api = async () => {
    try {
        return await api("GET", "/api/v1/profile")
    } catch (error) {
        throw error
    }
}

export const get_users_api = async () => {
    try {
        return await api("GET", "/api/v1/admin/users")
    } catch (error) {
        throw error
    }
}


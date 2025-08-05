import { token } from "@/stores/auth";

// const API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = "https://ecommerce-be-zixc.onrender.com";

export const api = async (method, url, data) => {
    const urlApi = API_BASE_URL + url;
    let body;
    if(data){
        body = JSON.stringify(data)
    }

    try {
        return await fetch(urlApi, {
            method: method,
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token.value,
            },
            body: body,
        }).then(async res => {
            const data = await res.json()

            if(res.ok) {
                return data;
            } else {
                throw data;
            }
        })
    } catch (error) {
        console.error("API request error:", error);
        throw error.error
    }
}

export const apiFormData = async (method, url, formData) => {
    const urlApi = API_BASE_URL + url;

    try {
        const response = await fetch(urlApi, {
            method: method,
            mode: "cors",
            headers: {
                "Authorization": token.value, 
            },
            body: formData,
        });

        const responseData = await response.json();

        if (response.ok) {
            return responseData;
        } else {
            throw responseData;
        }
    } catch (error) {
        console.error("API FormData request error:", error);
        throw error.error || 'An unknown error occurred';
    }
};
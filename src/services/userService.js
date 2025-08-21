import { api } from "../models/api";

export const getAdminInfo = async () => {
  try {
    return await api("GET", "/admin-info");
  } catch (error) {
    throw error;
  }
};

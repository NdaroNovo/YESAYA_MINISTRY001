import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { ENV } from "../utils/env";

export const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("ym_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("ym_access_token");
    }
    return Promise.reject(error);
  }
);

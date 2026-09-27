import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { ENV } from "../utils/env";

export const ACCESS_KEY = "ym_access_token";
export const REFRESH_KEY = "ym_refresh_token";
const SERVER_KEY = "ym_server_url";

export const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------- Server inayoweza kubadilishwa (production / demo) ----------

/** Rekebisha anwani: ongeza http:// na /api kama hazipo, ondoa "/" ya mwisho. */
export function normalizeServerUrl(input: string): string {
  let url = input.trim().replace(/\/+$/, "");
  if (!url) return ENV.API_URL;
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  if (!/\/api$/i.test(url)) url = `${url}/api`;
  return url;
}

export async function loadServerUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(SERVER_KEY);
    if (saved) api.defaults.baseURL = saved;
  } catch {}
  return api.defaults.baseURL || ENV.API_URL;
}

export async function saveServerUrl(input: string): Promise<string> {
  const url = normalizeServerUrl(input);
  api.defaults.baseURL = url;
  if (url === ENV.API_URL) await AsyncStorage.removeItem(SERVER_KEY);
  else await AsyncStorage.setItem(SERVER_KEY, url);
  return url;
}

export function currentServerUrl(): string {
  return api.defaults.baseURL || ENV.API_URL;
}

export function isDefaultServer(): boolean {
  return currentServerUrl() === ENV.API_URL;
}

// ---------- Location ya mwisho (backend inaisoma kwa X-Location-* headers) ----------

let lastLocation: { latitude: number; longitude: number } | null = null;

export function setLastLocation(loc: { latitude: number; longitude: number } | null) {
  lastLocation = loc;
}

// ---------- Tokens ----------

let onAuthFailure: (() => void) | null = null;

/** AppNavigator inasajili hii ili mtumiaji arudishwe Login refresh token ikiisha. */
export function setAuthFailureHandler(handler: () => void) {
  onAuthFailure = handler;
}

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_KEY);
  if (token && !config.url?.startsWith("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (lastLocation) {
    config.headers["X-Location-Lat"] = lastLocation.latitude.toFixed(6);
    config.headers["X-Location-Lng"] = lastLocation.longitude.toFixed(6);
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refresh) return null;
  try {
    const { data } = await api.post<{ access: string; refresh?: string }>("/auth/refresh/", { refresh });
    await SecureStore.setItemAsync(ACCESS_KEY, data.access);
    if (data.refresh) await SecureStore.setItemAsync(REFRESH_KEY, data.refresh);
    return data.access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthCall = original?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      refreshing = refreshing || refreshAccessToken().finally(() => { refreshing = null; });
      const access = await refreshing;
      if (access) {
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      }
      await SecureStore.deleteItemAsync(ACCESS_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      onAuthFailure?.();
    }
    return Promise.reject(error);
  }
);

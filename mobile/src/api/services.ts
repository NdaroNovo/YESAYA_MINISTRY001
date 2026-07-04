import { api } from "./client";
import type {
  User,
  Jimbo,
  Mtaa,
  Church,
  EvangelismRecord,
  OfferingType,
  Offering,
  DashboardStats,
} from "../types";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post<LoginResponse>("/auth/login/", payload),
  refresh: (refresh: string) => api.post<{ access: string }>("/auth/refresh/", { refresh }),
  changePassword: (current: string, newPass: string) =>
    api.post("/change-password/", { current_password: current, new_password: newPass }),
  me: () => api.get<User>("/users/me/"),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard-stats/"),
};

export const jimboApi = {
  get: () => api.get<Jimbo[]>("/jimbo/"),
  create: (data: Partial<Jimbo>) => api.post<Jimbo>("/jimbo/", data),
  update: (id: number, data: Partial<Jimbo>) => api.patch<Jimbo>(`/jimbo/${id}/`, data),
  delete: (id: number) => api.delete(`/jimbo/${id}/`),
};

export const mtaaApi = {
  get: () => api.get<Mtaa[]>("/mitaa/"),
  create: (data: Partial<Mtaa>) => api.post<Mtaa>("/mitaa/", data),
  update: (id: number, data: Partial<Mtaa>) => api.patch<Mtaa>(`/mitaa/${id}/`, data),
  delete: (id: number) => api.delete(`/mitaa/${id}/`),
};

export const churchApi = {
  get: () => api.get<Church[]>("/churches/"),
  create: (data: Partial<Church>) => api.post<Church>("/churches/", data),
  update: (id: number, data: Partial<Church>) => api.patch<Church>(`/churches/${id}/`, data),
  delete: (id: number) => api.delete(`/churches/${id}/`),
};

export const evangelismApi = {
  get: () => api.get<EvangelismRecord[]>("/evangelism/"),
  create: (data: Partial<EvangelismRecord>) => api.post<EvangelismRecord>("/evangelism/", data),
  update: (id: number, data: Partial<EvangelismRecord>) =>
    api.patch<EvangelismRecord>(`/evangelism/${id}/`, data),
  delete: (id: number) => api.delete(`/evangelism/${id}/`),
};

export const offeringTypeApi = {
  get: () => api.get<OfferingType[]>("/offering-types/"),
};

export const offeringApi = {
  get: () => api.get<Offering[]>("/offerings/"),
  create: (data: Partial<Offering>) => api.post<Offering>("/offerings/", data),
  update: (id: number, data: Partial<Offering>) => api.patch<Offering>(`/offerings/${id}/`, data),
  delete: (id: number) => api.delete(`/offerings/${id}/`),
};

export const userApi = {
  get: () => api.get<User[]>("/users/"),
  create: (data: Partial<User>) => api.post<User>("/users/", data),
  update: (id: number, data: Partial<User>) => api.patch<User>(`/users/${id}/`, data),
  delete: (id: number) => api.delete(`/users/${id}/`),
};

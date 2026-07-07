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
  PaginatedResponse,
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

type ListResponse<T> = PaginatedResponse<T> | T[];

const toArray = <T>(data: ListResponse<T>): T[] =>
  Array.isArray(data) ? data : data.results;

export const jimboApi = {
  get: () => api.get<ListResponse<Jimbo>>("/jimbo/").then((r) => ({ ...r, data: toArray(r.data) })),
  create: (data: Partial<Jimbo>) => api.post<Jimbo>("/jimbo/", data),
  update: (id: number, data: Partial<Jimbo>) => api.patch<Jimbo>(`/jimbo/${id}/`, data),
  delete: (id: number) => api.delete(`/jimbo/${id}/`),
};

export const mtaaApi = {
  get: () => api.get<ListResponse<Mtaa>>("/mitaa/").then((r) => ({ ...r, data: toArray(r.data) })),
  create: (data: Partial<Mtaa>) => api.post<Mtaa>("/mitaa/", data),
  update: (id: number, data: Partial<Mtaa>) => api.patch<Mtaa>(`/mitaa/${id}/`, data),
  delete: (id: number) => api.delete(`/mitaa/${id}/`),
};

export const churchApi = {
  get: (mtaaId?: number) =>
    api.get<ListResponse<Church>>("/churches/", { params: mtaaId ? { mtaa: mtaaId } : {} })
      .then((r) => ({ ...r, data: toArray(r.data) })),
  getOne: (id: number) => api.get<Church>(`/churches/${id}/`),
  create: (data: Partial<Church>) => api.post<Church>("/churches/", data),
  update: (id: number, data: Partial<Church>) => api.patch<Church>(`/churches/${id}/`, data),
  delete: (id: number) => api.delete(`/churches/${id}/`),
};

export const evangelismApi = {
  get: (churchId?: number) =>
    api.get<ListResponse<EvangelismRecord>>("/evangelism/", { params: churchId ? { church: churchId } : {} })
      .then((r) => ({ ...r, data: toArray(r.data) })),
  getByFilter: (params: { church?: number; mtaa?: number; jimbo?: number }) =>
    api.get<ListResponse<EvangelismRecord>>("/evangelism/", { params })
      .then((r) => ({ ...r, data: toArray(r.data) })),
  create: (data: Partial<EvangelismRecord>) => api.post<EvangelismRecord>("/evangelism/", data),
  update: (id: number, data: Partial<EvangelismRecord>) =>
    api.patch<EvangelismRecord>(`/evangelism/${id}/`, data),
  delete: (id: number) => api.delete(`/evangelism/${id}/`),
};

export const offeringTypeApi = {
  get: () => api.get<ListResponse<OfferingType>>("/offering-types/").then((r) => ({ ...r, data: toArray(r.data) })),
};

export const offeringApi = {
  get: (churchId?: number) =>
    api.get<ListResponse<Offering>>("/offerings/", { params: churchId ? { church: churchId } : {} })
      .then((r) => ({ ...r, data: toArray(r.data) })),
  getByFilter: (params: { church?: number; mtaa?: number; jimbo?: number }) =>
    api.get<ListResponse<Offering>>("/offerings/", { params })
      .then((r) => ({ ...r, data: toArray(r.data) })),
  create: (data: Partial<Offering>) => api.post<Offering>("/offerings/", data),
  update: (id: number, data: Partial<Offering>) => api.patch<Offering>(`/offerings/${id}/`, data),
  delete: (id: number) => api.delete(`/offerings/${id}/`),
};

export const userApi = {
  get: () => api.get<ListResponse<User>>("/users/").then((r) => ({ ...r, data: toArray(r.data) })),
  create: (data: Partial<User>) => api.post<User>("/users/", data),
  update: (id: number, data: Partial<User>) => api.patch<User>(`/users/${id}/`, data),
  delete: (id: number) => api.delete(`/users/${id}/`),
};

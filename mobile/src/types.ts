export type UserRole = "super_admin" | "jimbo_admin" | "mtaa_leader" | "church_leader" | "viewer";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string;
  assigned_mtaa: number | null;
  assigned_church: number | null;
  use_location: boolean;
}

export interface Jimbo {
  id: number;
  name: string;
  district: string;
  region: string;
  address: string;
  phone: string;
  email: string;
}

export interface Mtaa {
  id: number;
  jimbo: number;
  name: string;
  leader_name: string;
  phone: string;
  location: string;
  is_active: boolean;
}

export interface Church {
  id: number;
  mtaa: number;
  name: string;
  pastor_name: string;
  phone: string;
  address: string;
  member_count: number;
  is_active: boolean;
}

export interface EvangelismRecord {
  id: number;
  church: number;
  recorded_by?: number;
  month: number;
  year: number;
  baptized: number;
  converted: number;
  visited: number;
  supported: number;
  comments: string;
  evidence?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  custom_fields?: { id?: number; label: string; value: string }[];
}

export interface OfferingType {
  id: number;
  name: string;
  slug: string;
  kind: string;
  church_percentage: string;
  field_percentage: string;
  description: string;
  is_active: boolean;
}

export interface Offering {
  id: number;
  church: number;
  offering_type: number;
  amount: string;
  church_share: string;
  field_share: string;
  month: number;
  year: number;
  notes: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DashboardStats {
  total_mitaa: number;
  total_churches: number;
  total_members: number;
  total_baptized: number;
  total_converted: number;
  total_visited: number;
  total_supported: number;
  total_offerings: number;
  church_share: number;
  field_share: number;
}

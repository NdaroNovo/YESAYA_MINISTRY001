export type Role = "super_admin" | "jimbo_admin" | "mtaa_leader" | "church_leader" | "viewer"

export interface ApiUser {
  id: number
  username: string
  email: string
  full_name: string
  role: Role
  phone: string
  assigned_mtaa: number | null
  assigned_church: number | null
  assigned_mtaa_name?: string
  assigned_church_name?: string
  is_active: boolean
  use_location: boolean
  last_login?: string | null
}

export interface Jimbo {
  id: number
  name: string
  district: string
  region: string
  address: string
  phone: string
  email: string
  created_at: string
}

export interface Mtaa {
  id: number
  jimbo: number
  jimbo_name: string
  name: string
  leader_name: string
  phone: string
  location: string
  church_count: number
}

export interface Church {
  id: number
  mtaa: number
  mtaa_name: string
  name: string
  pastor_name: string
  phone: string
  address: string
  member_count: number
}

export interface EvangelismRecord {
  id: number
  church: number
  church_name: string
  mtaa_name: string
  recorded_by_name: string
  month: number
  year: number
  baptized: number
  converted: number
  visited: number
  supported: number
  comments: string
  latitude: string | null
  longitude: string | null
  created_at: string
}

export interface OfferingType {
  id: number
  name: string
  slug: string
  kind: string
  church_percentage: string
  field_percentage: string
  description: string
  is_active: boolean
}

export interface Offering {
  id: number
  church: number
  church_name: string
  mtaa_name: string
  offering_type: number
  offering_type_name: string
  amount: string
  church_share: string
  field_share: string
  month: number
  year: number
  notes: string
  latitude: string | null
  longitude: string | null
  created_at: string
}

export interface AuditLogEntry {
  id: number
  user: number | null
  user_name: string
  action: string
  path: string
  ip_address: string | null
  latitude: string | null
  longitude: string | null
  description: string
  created_at: string
}

export interface DashboardStats {
  year: number
  current_month: number
  total_jimbo: number
  total_mitaa: number
  total_churches: number
  total_members: number
  total_baptized: number
  total_converted: number
  total_visited: number
  total_supported: number
  total_offerings: number | string
  church_share: number | string
  field_share: number | string
  month_offerings: number | string
  year_offerings: number | string
  monthly: { month: number; offerings: number; baptized: number; converted: number }[]
  offerings_by_type: { name: string; total: number }[]
  recent_activity: AuditLogEntry[]
}

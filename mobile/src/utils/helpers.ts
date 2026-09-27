import type { User, UserRole } from "../types";

export const MONTHS = [
  "", "Januari", "Februari", "Machi", "Aprili", "Mei", "Juni",
  "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba",
];

export function formatMoney(amount: number | string | undefined): string {
  const val = typeof amount === "string" ? parseFloat(amount) : amount;
  if (val === undefined || val === null || isNaN(val)) return "0";
  return val.toLocaleString("sw-TZ", { maximumFractionDigits: 2 });
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    super_admin: "Msimamizi Mkuu",
    jimbo_admin: "Msimamizi wa Jimbo",
    mtaa_leader: "Kiongozi wa Mtaa",
    church_leader: "Kiongozi wa Kanisa",
    viewer: "Mwangaliazi",
  };
  return map[role] || role;
}

// Lazima zilingane na backend/core/permissions.py (ROLE_LEVELS)
const ROLE_LEVELS: Record<UserRole, number> = {
  viewer: 0,
  church_leader: 1,
  mtaa_leader: 2,
  jimbo_admin: 3,
  super_admin: 4,
};

/** Je, mtumiaji ana role hii au zaidi? (mf. Mtaa/Jimbo = jimbo_admin, Kanisa = mtaa_leader, Taarifa = church_leader) */
export function roleAtLeast(user: User | null | undefined, role: UserRole): boolean {
  if (!user) return false;
  return (ROLE_LEVELS[user.role] ?? -1) >= ROLE_LEVELS[role];
}

/** Geuza kosa la API kuwa ujumbe unaosomeka kwa Kiswahili. */
export function apiErrorMessage(err: any, fallback: string): string {
  if (!err?.response) {
    return "Imeshindwa kufikia server. Hakikisha una intaneti na anwani ya server ni sahihi.";
  }
  const { status, data } = err.response;
  if (status === 403) return data?.detail || "Huna ruhusa ya kufanya kitendo hiki.";
  if (status === 401) return "Muda wa kuingia umeisha. Tafadhali ingia tena.";
  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;
    const messages = Object.values(data).flat().filter((m) => typeof m === "string");
    if (messages.length) return messages.join("\n");
  }
  return fallback;
}

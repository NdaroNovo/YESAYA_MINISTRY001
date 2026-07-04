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

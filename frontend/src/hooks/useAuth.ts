import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { roleAtLeast, ROLE_LEVELS } from "@/lib/format"

export function useAuth() {
  const user = useSelector((state: RootState) => state.auth.user)
  const can = (min: keyof typeof ROLE_LEVELS) => roleAtLeast(user?.role, min)
  return { user, can }
}

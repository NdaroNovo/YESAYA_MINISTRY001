import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDispatch } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FormError } from "@/components/ui/form"
import { PageHeader } from "@/components/PageParts"
import LocationCapture from "@/components/LocationCapture"
import { toast } from "@/components/Toast"
import { KeyRound, LogOut, UserCircle } from "lucide-react"
import api from "@/api/axios"
import { logout } from "@/store"
import { useAuth } from "@/hooks/useAuth"
import { changePasswordSchema, ChangePasswordFormData } from "@/schemas/auth"
import { ROLE_LABELS, errorMessage } from "@/lib/format"

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError(null)
    try {
      await api.post("/change-password/", {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      })
      toast("Nenosiri limebadilishwa.")
      reset()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Wasifu Wangu" subtitle="Taarifa za akaunti yako" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle className="h-5 w-5 text-gold" /> Taarifa za Mtumiaji
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Jina kamili" value={user?.fullName} />
            <Info label="Username" value={user?.username} />
            <Info label="Barua pepe" value={user?.email} />
            <Info label="Simu" value={user?.phone} />
            <Info label="Jukumu" value={user?.role ? ROLE_LABELS[user.role] : ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-gold" /> Badilisha Nenosiri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <Field label="Nenosiri la sasa">
                <Input type="password" autoComplete="current-password" {...register("currentPassword")} />
                {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
              </Field>
              <Field label="Nenosiri jipya">
                <Input type="password" autoComplete="new-password" {...register("newPassword")} />
                {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
              </Field>
              <Field label="Thibitisha nenosiri jipya">
                <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </Field>
              <FormError message={error} />
              <Button type="submit" variant="gold" disabled={isSubmitting}>
                {isSubmitting ? "Inabadilisha..." : "Badilisha Nenosiri"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <LocationCapture />
          <Button variant="outline" className="w-full text-red-600" onClick={() => dispatch(logout())}>
            <LogOut className="mr-2 h-4 w-4" /> Toka (Logout)
          </Button>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-navy">{value || "—"}</p>
    </div>
  )
}

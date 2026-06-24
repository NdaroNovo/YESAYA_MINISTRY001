import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDispatch } from "react-redux"
import { loginSuccess, type AuthUserRole } from "@/store"
import { login } from "@/api/services/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginSchema, LoginFormData } from "@/schemas/auth"
import LocationCapture from "@/components/LocationCapture"
import { useLocation } from "@/hooks/useLocation"
import { Church, Lock, User, Eye, EyeOff } from "lucide-react"

export default function Login() {
  const dispatch = useDispatch()
  const { enabled, capture } = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null)
    try {
      if (enabled) {
        await capture()
      }
      const response = await login({
        username: data.username,
        password: data.password,
      })
      localStorage.setItem("ym_access_token", response.access)
      dispatch(
        loginSuccess({
          user: {
            id: response.user.id,
            username: response.user.username,
            email: response.user.email,
            role: response.user.role as AuthUserRole,
            fullName: response.user.full_name,
            assignedMtaa: response.user.assigned_mtaa,
            assignedChurch: response.user.assigned_church,
          },
          token: response.access,
        })
      )
    } catch (error: any) {
      console.error("Login failed", error)
      if (error.response) {
        const detail = error.response.data?.detail
        if (detail) {
          setLoginError(detail)
        } else {
          setLoginError("Jina la mtumiaji au nenosiri si sahihi.")
        }
      } else if (error.request) {
        setLoginError("Haiwezi kufikia server. Hakikisha backend inaendesha kwenye http://localhost:8000")
      } else {
        setLoginError("Kuna tatizo la mtandao. Jaribu tena.")
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Decorative left panel */}
      <div className="hidden lg:flex w-1/2 bg-navy items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy-800" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-24 h-24 rounded-full bg-gold mx-auto mb-6 flex items-center justify-center text-navy text-4xl font-bold">
            YM
          </div>
          <h1 className="text-4xl font-bold mb-4">YESAYA MINISTRY</h1>
          <p className="text-lg text-navy-100">
            Karibu katika mfumo wa usimamizi wa Jimbo, Mitaa na Makanisa.
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-navy mx-auto mb-4 flex items-center justify-center text-gold text-2xl font-bold">
              YM
            </div>
            <h1 className="text-2xl font-bold text-navy">YESAYA MINISTRY</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-navy">Ingia katika mfumo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Weka jina la mtumiaji na nenosiri lako
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Jina la mtumiaji</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...register("username")}
                  placeholder="Weka jina la mtumiaji"
                  className="pl-10"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-navy">Nenosiri</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Weka nenosiri"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" {...register("rememberMe")} className="rounded" />
                Nikumbuke
              </label>
              <button type="button" className="text-gold hover:underline">
                Umesahau nenosiri?
              </button>
            </div>

            <LocationCapture />

            {loginError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                {loginError}
              </div>
            )}

            <Button type="submit" variant="gold" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? "Inaingia..." : "Ingia"}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              <Church className="w-3 h-3" />
              © {new Date().getFullYear()} YESAYA MINISTRY. Haki zote zimehifadhiwa.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

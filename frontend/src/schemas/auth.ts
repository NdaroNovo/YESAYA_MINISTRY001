import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(1, "Jina la mtumiaji linahitajika"),
  password: z.string().min(1, "Nenosiri linahitajika"),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nenosiri la sasa linahitajika"),
    newPassword: z
      .string()
      .min(8, "Nenosiri jipya lazima liwe na herufi 8 au zaidi")
      .regex(/[A-Z]/, "Lazima liwe na herufi kubwa")
      .regex(/[a-z]/, "Lazima liwe na herufi ndogo")
      .regex(/[0-9]/, "Lazima liwe na namba")
      .regex(/[^A-Za-z0-9]/, "Lazima liwe na alama maalum"),
    confirmPassword: z.string().min(1, "Thibitisha nenosiri"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Manenosiri hayalingani",
    path: ["confirmPassword"],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

import { useEffect, useState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"

type ToastKind = "success" | "error"
interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

const EVENT = "ym-toast"

export function toast(message: string, kind: ToastKind = "success") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, kind } }))
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, kind } = (e as CustomEvent).detail
      const id = Date.now() + Math.random()
      setItems((s) => [...s, { id, message, kind }])
      setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4000)
    }
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 print:hidden">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex max-w-md items-start gap-2 whitespace-pre-line rounded-lg px-4 py-3 text-sm shadow-lg ${
            t.kind === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {t.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  )
}

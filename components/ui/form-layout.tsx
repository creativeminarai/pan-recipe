import { cn } from "@/lib/utils"
import type React from "react"

interface FormSectionProps {
  children: React.ReactNode
  className?: string
}

export function FormSection({ children, className }: FormSectionProps) {
  return <div className={cn("space-y-4 rounded-lg bg-gray-50/50 p-4", className)}>{children}</div>
}

export function FormContainer({ children, className }: FormSectionProps) {
  return <div className={cn("mx-auto max-w-2xl space-y-6", className)}>{children}</div>
}


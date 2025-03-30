import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground ring-border",
        pending:
          "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
        success:
          "bg-green-50 text-green-700 ring-green-600/20",
        error:
          "bg-red-50 text-red-700 ring-red-600/20",
        warning:
          "bg-orange-50 text-orange-700 ring-orange-600/20",
        info:
          "bg-blue-50 text-blue-700 ring-blue-600/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface StatusProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  icon?: React.ReactNode
}

export function Status({
  className,
  variant,
  icon,
  children,
  ...props
}: StatusProps) {
  return (
    <span className={cn(statusVariants({ variant }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  )
} 
import React from "react"
import { Button } from "./button"
import { PlusCircle, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ComponentPropsWithoutRef } from "react"

export interface PushButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  icon?: LucideIcon
  iconPosition?: "left" | "right"
}

export const PushButton = React.forwardRef<HTMLButtonElement, PushButtonProps>(
  ({ className, children, icon: Icon = PlusCircle, iconPosition = "left", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "flex items-center gap-3",
          iconPosition === "right" && "flex-row-reverse",
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5" />
        {children}
      </Button>
    )
  }
)

PushButton.displayName = "PushButton" 
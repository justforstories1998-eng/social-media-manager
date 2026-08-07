import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "neon"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-[0.985] disabled:opacity-60"
    
    const variants = {
      default: "bg-white text-black hover:bg-white/90",
      outline: "border border-white/20 hover:bg-white/5",
      ghost: "hover:bg-white/5",
      neon: "bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white shadow-[0_0_40px_rgba(124,58,237,0.45)] hover:shadow-[0_0_60px_rgba(124,58,237,0.65)]"
    }
    
    const sizes = {
      default: "h-11 px-6 text-sm",
      sm: "h-9 px-4 text-sm",
      lg: "h-12 px-8 text-base"
    }

    return (
      <button
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
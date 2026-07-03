import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'saffron'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-orange-600 text-white shadow hover:bg-orange-700': variant === 'default',
            'border border-orange-600 text-orange-600 bg-transparent hover:bg-orange-50': variant === 'outline',
            'hover:bg-gray-100 hover:text-gray-900': variant === 'ghost',
            'bg-red-600 text-white shadow-sm hover:bg-red-700': variant === 'destructive',
            'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow hover:from-orange-600 hover:to-amber-600': variant === 'saffron',
          },
          {
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-md px-3 text-xs': size === 'sm',
            'h-10 rounded-md px-8 text-base': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

import type React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCcw, Sparkles } from "lucide-react"

const loadingVariants = cva("flex items-center justify-center", {
  variants: {
    variant: {
      default: "",
      spinner: "",
      dots: "",
      pulse: "",
      skeleton: "",
      gradient: "",
    },
    size: {
      sm: "h-8 w-8",
      md: "h-12 w-12",
      lg: "h-16 w-16",
      xl: "h-24 w-24",
      full: "h-full w-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof loadingVariants> {
  text?: string
  textPosition?: "top" | "bottom" | "left" | "right"
  icon?: React.ReactNode
  fullScreen?: boolean
}

export function LoadingComponent({
  className,
  variant,
  size,
  text,
  textPosition = "bottom",
  icon,
  fullScreen = false,
  ...props
}: LoadingProps) {
  const LoadingIcon =
    icon ||
    (variant === "default" ? (
      <Loader2 className="animate-spin" />
    ) : variant === "spinner" ? (
      <div className="relative">
        <div className="h-full w-full rounded-full border-4 border-primary/30"></div>
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
      </div>
    ) : null)

  const renderContent = () => (
    <div
      className={cn(
        loadingVariants({ variant, size, className }),
        "flex-col gap-3",
        textPosition === "left" && "flex-row",
        textPosition === "right" && "flex-row-reverse",
        textPosition === "top" && "flex-col-reverse",
      )}
      {...props}
    >
      {variant === "dots" ? (
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 rounded-full bg-primary animate-bounce"></div>
        </div>
      ) : variant === "pulse" ? (
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-primary/20 animate-ping"></div>
          <div className="relative rounded-full bg-primary p-3">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      ) : variant === "skeleton" ? (
        <div className="space-y-2 w-full max-w-md">
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-muted rounded animate-pulse w-4/6"></div>
        </div>
      ) : variant === "gradient" ? (
        <div className="relative p-1 rounded-full overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-gradient">
          <div className="bg-background rounded-full p-3">
            <RefreshCcw className="h-6 w-6 text-primary animate-spin-slow" />
          </div>
        </div>
      ) : (
        LoadingIcon
      )}

      {text && (
        <span
          className={cn(
            "text-center text-sm font-medium text-muted-foreground",
            size === "lg" && "text-base",
            size === "xl" && "text-lg",
          )}
        >
          {text}
        </span>
      )}
    </div>
  )

  return fullScreen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      {renderContent()}
    </div>
  ) : (
    renderContent()
  )
}



import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "info" | "warning" | "danger";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, showValue = false, size = "md", variant = "default", ...props }, ref) => {
  const getVariantColor = () => {
    switch (variant) {
      case "success": return "bg-green-600";
      case "info": return "bg-blue-600";
      case "warning": return "bg-amber-500";
      case "danger": return "bg-red-600";
      default: return "bg-primary";
    }
  };

  const getHeight = () => {
    switch (size) {
      case "sm": return "h-2";
      case "lg": return "h-6";
      default: return "h-4";
    }
  };

  return (
    <div className={showValue ? "flex items-center gap-2" : undefined}>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          `relative w-full overflow-hidden rounded-full bg-secondary`,
          getHeight(),
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all",
            getVariantColor()
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showValue && <span className="text-sm font-medium">{value}%</span>}
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

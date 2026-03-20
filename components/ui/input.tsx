import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-transparent bg-ec-surface-container-high px-3 py-2 text-base text-ec-on-surface shadow-none transition-[background-color,box-shadow,transform] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ec-on-surface-variant/70 focus-visible:bg-ec-surface-container-highest focus-visible:ring-0 focus-visible:shadow-[inset_0_-2px_0_0_var(--color-ec-primary)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:bg-ec-error-container/35 aria-invalid:shadow-[inset_0_-2px_0_0_var(--color-ec-error)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }

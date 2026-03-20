import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border border-transparent bg-ec-surface-container-high px-3 py-3 text-base text-ec-on-surface shadow-none transition-[background-color,box-shadow] outline-none placeholder:text-ec-on-surface-variant/70 focus-visible:bg-ec-surface-container-highest focus-visible:ring-0 focus-visible:shadow-[inset_0_-2px_0_0_var(--color-ec-primary)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:bg-ec-error-container/35 aria-invalid:shadow-[inset_0_-2px_0_0_var(--color-ec-error)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

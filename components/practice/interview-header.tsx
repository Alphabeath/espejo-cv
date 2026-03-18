"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function InterviewHeader() {
  const [seconds, setSeconds] = useState(1122) // 18:42

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`

  return (
    <header className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-xl">
        {/* Live indicator */}
        <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ec-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ec-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ec-primary" />
          </span>
          Entrevista en curso
        </span>

        <h1
          className="text-4xl font-extrabold tracking-tight text-ec-on-surface md:text-5xl"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Simulación de Estrategia <br />
          de Producto Senior
        </h1>
      </div>

      {/* Duration badge */}
      <div className="flex gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-ec-surface-container-low px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wider text-ec-on-surface-variant">
            Duración
          </span>
          <span
            className="font-bold text-ec-on-surface"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {formatted}
          </span>
        </div>
      </div>
    </header>
  )
}

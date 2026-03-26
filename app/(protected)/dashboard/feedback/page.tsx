"use client"

import { FeedbackPage } from "@/components/feedback"

export default function FeedbackRoute() {
  return (
    <main
      className="min-h-svh overflow-y-auto px-6 py-8 md:px-10"
      aria-label="Página de feedback"
    >
      <FeedbackPage />
    </main>
  )
}

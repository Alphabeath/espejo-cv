"use client"

import { useParams } from "next/navigation"

import { FeedbackSessionDetail } from "@/components/feedback/feedback-session-detail"

export default function FeedbackSessionRoute() {
  const params = useParams()
  const sessionId = params.sessionId as string

  return (
    <main
      className="min-h-svh overflow-y-auto px-6 py-8 md:px-10"
      aria-label="Detalle de sesión de feedback"
    >
      <FeedbackSessionDetail sessionId={sessionId} />
    </main>
  )
}

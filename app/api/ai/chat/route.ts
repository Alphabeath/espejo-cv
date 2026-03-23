import { NextResponse } from "next/server"

import { generateChatReply } from "@/services/ai.service"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, cvSummary, jobPosition, interviewType, focusAreas, plannedQuestions } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format." },
        { status: 400 },
      )
    }

    const reply = await generateChatReply({
      messages,
      cvSummary,
      jobPosition,
      interviewType: interviewType || "estructurada",
      focusAreas: focusAreas || [],
      plannedQuestions: plannedQuestions || []
    })

    return NextResponse.json(reply)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar la respuesta de chat.";

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

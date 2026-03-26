import { NextResponse } from "next/server"

import { generateInterviewFeedback } from "@/services/ai.service"

export const runtime = "nodejs"

/**
 * POST /api/ai/feedback
 *
 * Receives interview data and generates AI evaluation.
 * All Appwrite reads/writes happen client-side; this route only handles AI generation.
 *
 * Body: { cvText, jobPosition, turns: { turnIndex, question, answer }[] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cvText, jobPosition, turns } = body

    if (typeof cvText !== "string" || cvText.trim().length === 0) {
      return NextResponse.json(
        { error: "Falta el texto del CV." },
        { status: 400 },
      )
    }

    if (typeof jobPosition !== "string" || jobPosition.trim().length === 0) {
      return NextResponse.json(
        { error: "Falta el puesto de trabajo." },
        { status: 400 },
      )
    }

    if (!Array.isArray(turns) || turns.length === 0) {
      return NextResponse.json(
        { error: "No hay respuestas para evaluar." },
        { status: 400 },
      )
    }

    const feedback = await generateInterviewFeedback({
      cvText,
      jobPosition,
      turns: turns.map((t: { turnIndex: number; question: string; answer: string }) => ({
        turnIndex: t.turnIndex,
        question: t.question,
        answer: t.answer,
      })),
    })

    return NextResponse.json(feedback)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar la evaluación de la entrevista."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

import { generateQuestionSpeech } from "@/services/ai.service"

export const runtime = "nodejs"

/**
 * POST /api/ai/speak
 *
 * Pure TTS generation — no Appwrite interaction.
 * Caching is handled client-side where the browser session is available.
 *
 * Body: { text: string }
 * Returns: audio/mpeg binary
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text = body.text as string | undefined

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Falta el texto para generar audio." },
        { status: 400 },
      )
    }

    const { audio, mediaType } = await generateQuestionSpeech(text)

    return new Response(Buffer.from(audio), {
      headers: {
        "Content-Type": mediaType,
        "Cache-Control": "private, max-age=86400",
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar el audio de la pregunta."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

import { transcribeInterviewAudio } from "@/services/ai.service"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio")
    const language = formData.get("language")

    if (!(audioFile instanceof File)) {
      return NextResponse.json(
        { error: "Debes adjuntar un archivo de audio válido." },
        { status: 400 },
      )
    }

    const transcription = await transcribeInterviewAudio({
      audioFile,
      language: typeof language === "string" ? language : undefined,
    })

    return NextResponse.json(transcription)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo transcribir el audio.";

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
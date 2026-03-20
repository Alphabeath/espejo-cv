import { experimental_transcribe as transcribe } from "ai"
import { createDeepgram } from "@ai-sdk/deepgram"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File | null

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 })
    }

    const audioBuffer = await audioFile.arrayBuffer()
    const deepgram = createDeepgram({
      apiKey: process.env.DEEPGRAM_API_KEY,
    })

    const result = await transcribe({
      model: deepgram.transcription("nova-2"),
      audio: new Uint8Array(audioBuffer),
      providerOptions: {
        deepgram: {
          language: "es",
          smartFormat: true,
          punctuate: true,
        },
      },
    })

    return Response.json({ text: result.text })
  } catch (error) {
    console.error("[transcribe] Error:", error)
    return Response.json(
      { error: "Transcription failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

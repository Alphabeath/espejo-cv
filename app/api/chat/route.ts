import { streamText } from "ai"
import { createGroq } from "@ai-sdk/groq"

import { getInterviewSystemPrompt } from "@/lib/interview-prompts"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  const { messages, cvText, jobPosition } = await req.json()

  // Normalizar los mensajes para asegurar que Groq los entiende (a veces falla si recibe `parts` complejos)
  const normalizedMessages = messages.map((m: any) => {
    if (m.parts && Array.isArray(m.parts)) {
      return {
        role: m.role,
        content: m.parts.map((p: any) => p.text).filter(Boolean).join(" "),
      }
    }
    return m
  })

  try {
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: getInterviewSystemPrompt(cvText ?? "", jobPosition ?? ""),
      messages: normalizedMessages,
      onError: (err) => console.error("[streamText] Error de Groq:", err),
      onFinish: (obs) => console.log("[streamText] Groq streaming finalizado:", obs.finishReason),
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("[POST chat] Exception:", error)
    throw error
  }
}

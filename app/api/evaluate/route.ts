import { generateObject } from "ai"
import { createGroq } from "@ai-sdk/groq"

import { evaluationSchema, getEvaluationPrompt } from "@/lib/interview-prompts"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { messages, jobPosition } = await req.json()

    // Construir la conversación como texto para evaluación
    const conversationText = messages
      .map((m: { role: string; content: string }) => {
        const label = m.role === "assistant" ? "Entrevistador" : "Candidato"
        return `${label}: ${m.content}`
      })
      .join("\n\n")

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: evaluationSchema,
      system: getEvaluationPrompt(jobPosition),
      prompt: `Evalúa la siguiente entrevista:\n\n${conversationText}`,
    })

    return Response.json(object)
  } catch (error) {
    console.error("[evaluate] Error:", error)
    return Response.json(
      { error: "Evaluation failed" },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"

import { generateInterviewPlan } from "@/services/ai.service"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const cvFile = formData.get("cvFile")
    const jobPosition = formData.get("jobPosition")
    const interviewType = formData.get("interviewType") as string | null

    if (!(cvFile instanceof File)) {
      return NextResponse.json(
        { error: "Debes adjuntar un CV en PDF." },
        { status: 400 },
      )
    }

    if (typeof jobPosition !== "string" || jobPosition.trim().length === 0) {
      return NextResponse.json(
        { error: "Debes indicar el puesto al que postulas." },
        { status: 400 },
      )
    }

    const plan = await generateInterviewPlan({
      cvFile,
      jobPosition,
      interviewType: interviewType || "estructurada",
    })

    return NextResponse.json(plan)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo analizar el CV y el puesto.";

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
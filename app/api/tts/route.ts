import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get("text")
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

  if (!text || !DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: "Missing text or API Key" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=aura-2-celeste-es`,
      {
        method: "POST", // Deepgram prefiere POST incluso para peticiones rápidas
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Deepgram TTS failed" }, { status: response.status })
    }

    // Retornamos el stream directamente sin esperar el buffer completo
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("TTS Route Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: "Missing Deepgram API Key" }, { status: 500 })
  }

  try {
    const response = await fetch(
      "https://api.deepgram.com/v1/speak?model=aura-2-celeste-es",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Deepgram TTS failed" }, { status: response.status })
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("TTS Route Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

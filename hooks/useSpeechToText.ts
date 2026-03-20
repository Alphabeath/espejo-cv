"use client"

import { useCallback, useRef, useState } from "react"

const SILENCE_THRESHOLD = 5 // Umbral de volumen (0-255)
const SILENCE_DURATION_MS = 3500 // 3.5 segundos de silencio para auto-enviar

export function useSpeechToText(onSilenceDetected?: () => void) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [volume, setVolume] = useState(0) // 0 to 255

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Web Audio API refs para el visualizador y detección de silencio
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const silenceStartRef = useRef<number | null>(null)

  /** Inicia la grabación del micrófono */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })

      streamRef.current = stream
      chunksRef.current = []

      // Setup Web Audio API for volume analysis
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioCtx()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const checkVolume = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
        setVolume(average)

        if (average < SILENCE_THRESHOLD) {
          if (silenceStartRef.current === null) {
            silenceStartRef.current = Date.now()
          } else if (Date.now() - silenceStartRef.current > SILENCE_DURATION_MS) {
            // Se detectó silencio por más de SILENCE_DURATION_MS
            if (onSilenceDetected) {
              onSilenceDetected()
            }
            silenceStartRef.current = null // Reset prevent double trigger
          }
        } else {
          silenceStartRef.current = null // Resetea si hay sonido
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume)
      }
      checkVolume()

      let mimeType = "audio/webm"
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus"
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(250) // Recolecta chunks cada 250ms
      setIsRecording(true)
      setTranscript("")
    } catch (error) {
      console.error("[STT] Error accediendo al micrófono:", error)
      throw error
    }
  }, [onSilenceDetected])

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
    }
    analyserRef.current = null
    setVolume(0)
    silenceStartRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  /** Para la grabación y envía el audio a transcribir */
  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        cleanupAudio()
        resolve("")
        return
      }

      mediaRecorder.onstop = async () => {
        cleanupAudio()
        setIsRecording(false)

        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" })
        chunksRef.current = []

        if (audioBlob.size === 0) {
          resolve("")
          return
        }

        // Enviar a la API de transcripción
        setIsTranscribing(true)
        try {
          const formData = new FormData()
          formData.append("audio", audioBlob, "recording.webm")

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}))
            throw new Error(`Transcription request failed: ${errData.details || response.statusText}`)
          }

          const data = await response.json()
          const text = data.text ?? ""
          setTranscript(text)
          resolve(text)
        } catch (error) {
          console.error("[STT] Error transcribiendo:", error)
          reject(error)
        } finally {
          setIsTranscribing(false)
        }
      }

      mediaRecorder.stop()
    })
  }, [cleanupAudio])

  /** Cancela la grabación sin transcribir */
  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.onstop = null
      mediaRecorder.stop()
    }
    cleanupAudio()
    chunksRef.current = []
    setIsRecording(false)
    setIsTranscribing(false)
  }, [cleanupAudio])

  return {
    isRecording,
    isTranscribing,
    transcript,
    volume,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}


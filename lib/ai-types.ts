export type InterviewType = "estructurada" | "no-estructurada" | "informal"

export type InterviewQuestion = {
  id: string
  text: string
}

export type InterviewPlan = {
  cvText: string
  cvSummary: string
  roleSummary: string
  focusAreas: string[]
  questions: InterviewQuestion[]
  interviewType?: InterviewType
}

export type AudioTranscriptionSegment = {
  text: string
  startSecond: number
  endSecond: number
}

export type AudioTranscription = {
  text: string
  durationInSeconds: number | null
  language: string | null
  segments: AudioTranscriptionSegment[]
}

export type ChatReply = {
  reply: string
  isFinished: boolean
  progress: number
}
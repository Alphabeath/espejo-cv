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
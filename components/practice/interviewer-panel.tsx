"use client"

import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

function WaveformBar({ height, delay }: { height: string; delay: string }) {
  return (
    <div
      className="w-[3px] rounded-sm bg-ec-primary"
      style={{
        height,
        animation: `bounce 1s infinite ${delay}`,
      }}
    />
  )
}

export function InterviewerPanel() {
  return (
    <div className="lg:col-span-5">
      <div className="relative flex flex-grow flex-col items-center justify-center overflow-hidden rounded-xl bg-ec-surface-container-low p-12">
        {/* Dot pattern background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(oklch(0.445 0.055 260) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Interviewer Avatar */}
        <div className="relative mb-8 h-64 w-64 overflow-hidden rounded-full shadow-2xl">
          <Image
            src="/interviewer-avatar.png"
            alt="Entrevistador IA"
            fill
            className="object-cover grayscale"
            style={{ opacity: 0.8 }}
            priority
          />
        </div>

        {/* Voice waveform visualization */}
        <div className="flex h-8 items-center gap-1">
          <WaveformBar height="0.5rem" delay="0.1s" />
          <WaveformBar height="1rem" delay="0.2s" />
          <WaveformBar height="1.5rem" delay="0.3s" />
          <WaveformBar height="2rem" delay="0.4s" />
          <WaveformBar height="1.25rem" delay="0.5s" />
          <WaveformBar height="1.75rem" delay="0.6s" />
          <WaveformBar height="0.75rem" delay="0.7s" />
        </div>

        {/* Status label */}
        <p
          className="mt-6 text-xs font-bold uppercase tracking-widest text-ec-primary"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          El entrevistador está escuchando
        </p>
      </div>
    </div>
  )
}

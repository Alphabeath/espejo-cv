"use client"

import { useState } from "react"
import { Pencil, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProfileData {
  name: string
  title: string
  email: string
  avatarUrl: string
}

interface SettingsProfileSectionProps {
  profile: ProfileData
  onProfileChange: (profile: ProfileData) => void
}

export function SettingsProfileSection({
  profile,
  onProfileChange,
}: SettingsProfileSectionProps) {
  function handleChange(field: keyof ProfileData, value: string) {
    onProfileChange({ ...profile, [field]: value })
  }

  return (
    <section id="perfil" className="animate-fade-in-up">
      <h3 className="font-headline text-2xl font-bold text-ec-primary mb-10 tracking-tight">
        Gestión de Perfil
      </h3>

      <div className="rounded-2xl bg-ec-surface-container-low p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-10">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="size-28 md:size-32 rounded-full ring-4 ring-ec-surface-container-lowest shadow-xl overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar del usuario"
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-ec-surface-container-high flex items-center justify-center">
                  <User className="size-10 text-ec-on-surface-variant" />
                </div>
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex size-9 items-center justify-center rounded-full signature-gradient text-ec-on-primary shadow-lg transition-transform hover:scale-110 active:scale-95"
              aria-label="Cambiar avatar"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>

          {/* Fields */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-ec-on-surface-variant">
                Nombre Completo
              </Label>
              <Input
                type="text"
                value={profile.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-ec-on-surface-variant">
                Cargo Profesional
              </Label>
              <Input
                type="text"
                value={profile.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-ec-on-surface-variant">
                Correo Electrónico
              </Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

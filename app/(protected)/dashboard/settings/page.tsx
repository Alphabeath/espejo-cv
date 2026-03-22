"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  SettingsProfileSection,
  SettingsCvSection,
  SettingsPreferencesSection,
  type CvDocument,
} from "@/components/settings"
import { useAuth } from "@/hooks/useAuth"

export default function SettingsPage() {
  const { user } = useAuth()

  const [profile, setProfile] = useState({
    name: "",
    title: "",
    email: "",
    avatarUrl: "",
  })

  // Sync profile state with Appwrite user session
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        // Appwrite prefs can store custom fields like title
        title: (user.prefs as Record<string, string>)?.title || "",
        avatarUrl: (user.prefs as Record<string, string>)?.avatarUrl || "",
      }))
    }
  }, [user])

  const [cvList, setCvList] = useState<CvDocument[]>([])

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
  })

  const [twoFactorEnabled] = useState(() => user?.mfa ?? false)
  const [isDirty, setIsDirty] = useState(false)

  function handleProfileChange(updated: typeof profile) {
    setProfile(updated)
    setIsDirty(true)
  }

  function handleUploadCv(file: File) {
    const newCv: CvDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      uploadedAt: `Subido el ${new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`,
      isPrimary: cvList.length === 0,
    }
    setCvList((prev) => [...prev, newCv])
    setIsDirty(true)
  }

  function handleDeleteCv(id: string) {
    setCvList((prev) => prev.filter((cv) => cv.id !== id))
    setIsDirty(true)
  }

  function handleSetPrimaryCv(id: string) {
    setCvList((prev) =>
      prev.map((cv) => ({ ...cv, isPrimary: cv.id === id }))
    )
    setIsDirty(true)
  }

  function handleDownloadCv(id: string) {
    // placeholder — would trigger real download
    console.log("Download CV:", id)
  }

  function handleNotificationsChange(
    prefs: typeof notifications
  ) {
    setNotifications(prefs)
    setIsDirty(true)
  }

  function handleSave() {
    // placeholder — would persist to backend via Appwrite
    setIsDirty(false)
  }

  function handleDiscard() {
    // Reset profile to the session values
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        title: (user.prefs as Record<string, string>)?.title || "",
        avatarUrl: (user.prefs as Record<string, string>)?.avatarUrl || "",
      })
    }
    setIsDirty(false)
  }

  return (
    <main className="flex-1 overflow-y-auto px-6 py-10 md:px-12 lg:px-16">
      {/* Page header */}
      <header className="mb-16 animate-fade-in-up">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-ec-on-surface text-glow">
          Configuración
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ec-on-surface-variant">
          Personaliza tu perfil y gestiona tus documentos para optimizar tus
          simulaciones de entrevista.
        </p>
      </header>

      {/* Sections */}
      <div className="space-y-24">
        <SettingsProfileSection
          profile={profile}
          onProfileChange={handleProfileChange}
        />

        <SettingsCvSection
          cvList={cvList}
          onUpload={handleUploadCv}
          onDelete={handleDeleteCv}
          onSetPrimary={handleSetPrimaryCv}
          onDownload={handleDownloadCv}
        />

        <SettingsPreferencesSection
          notifications={notifications}
          onNotificationsChange={handleNotificationsChange}
          twoFactorEnabled={twoFactorEnabled}
          onChangePassword={() => console.log("Change password")}
          onToggle2FA={() => console.log("Toggle 2FA")}
        />
      </div>

      {/* Footer Actions */}
      <footer className="mt-20 flex justify-end gap-4 border-t border-ec-outline-variant/15 pt-10 animate-fade-in-up delay-300">
        <Button
          type="button"
          variant="ghost"
          onClick={handleDiscard}
          disabled={!isDirty}
          className="rounded-xl px-8 text-sm font-semibold text-ec-on-surface-variant"
        >
          Descartar Cambios
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          className="rounded-xl px-10 text-sm font-bold"
        >
          Guardar Configuración
        </Button>
      </footer>
    </main>
  )
}

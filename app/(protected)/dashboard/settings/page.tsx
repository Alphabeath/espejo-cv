"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import {
  SettingsProfileSection,
  SettingsCvSection,
  SettingsPreferencesSection,
  type CvDocument,
} from "@/components/settings"
import { useAuth } from "@/hooks/useAuth"

import {
  updateUserName,
  updatePreferences,
  uploadCvFile,
  deleteCvFile,
  getCvDownloadUrl,
} from "@/services/settings.service"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState({
    name: "",
    title: "",
    email: "",
    avatarUrl: "",
  })

  const [cvList, setCvList] = useState<CvDocument[]>([])



  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Sync state with Appwrite session
  useEffect(() => {
    if (user) {
      const prefs = user.prefs as Record<string, any>
      setProfile({
        name: user.name || "",
        email: user.email || "",
        title: prefs?.title || "",
        avatarUrl: prefs?.avatarUrl || "",
      })

      try {
        if (prefs?.cvList) {
          setCvList(JSON.parse(prefs.cvList))
        }
      } catch (e) {
        setCvList([])
      }


      setTwoFactorEnabled(user.mfa ?? false)
      setIsDirty(false)
    }
  }, [user])

  function handleProfileChange(updated: typeof profile) {
    setProfile(updated)
    setIsDirty(true)
  }

  async function handleUploadCv(file: File) {
    setIsUploading(true)
    try {
      const uploadedFile = await uploadCvFile(file)
      
      const newCv: CvDocument = {
        id: uploadedFile.$id,
        name: file.name,
        uploadedAt: `Subido el ${new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`,
        isPrimary: cvList.length === 0,
      }
      
      const nextList = [...cvList, newCv]
      setCvList(nextList)
      
      // Persist list to preferences immediately since the file is uploaded
      await updatePreferences({
        ...(user?.prefs || {}),
        cvList: JSON.stringify(nextList),
      })
      
      await refreshUser()
    } catch (error) {
      console.error("Failed to upload CV", error)
      toast({
        title: "No pudimos subir tu CV",
        description: "Intenta nuevamente en unos instantes.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDeleteCv(id: string) {
    try {
      // Optimistic delete
      const nextList = cvList.filter((cv) => cv.id !== id)
      
      // Si el CV eliminado era el primary y quedan mas, marcamos el primero
      if (cvList.find(cv => cv.id === id)?.isPrimary && nextList.length > 0) {
          nextList[0].isPrimary = true
      }
      
      setCvList(nextList)
      await deleteCvFile(id)
      await updatePreferences({
        ...(user?.prefs || {}),
        cvList: JSON.stringify(nextList),
      })
      await refreshUser()
    } catch (error) {
      console.error("Failed to delete CV", error)
      toast({
        title: "No pudimos eliminar el CV",
        description: "Intenta nuevamente en unos instantes.",
      })
    }
  }

  async function handleSetPrimaryCv(id: string) {
    const nextList = cvList.map((cv) => ({ ...cv, isPrimary: cv.id === id }))
    setCvList(nextList)
    try {
      await updatePreferences({
        ...(user?.prefs || {}),
        cvList: JSON.stringify(nextList),
      })
      await refreshUser()
    } catch (error) {
      console.error("Failed to set primary CV", error)
      toast({
        title: "No pudimos actualizar tu CV principal",
        description: "Intenta nuevamente en unos instantes.",
      })
    }
  }

  async function handleDownloadCv(id: string, name: string) {
    try {
      const url = getCvDownloadUrl(id)
      
      const fallback = typeof window !== "undefined" ? window.localStorage.getItem("cookieFallback") : null
      const headers: Record<string, string> = {}
      if (fallback) headers["X-Fallback-Cookies"] = fallback
        
      const response = await fetch(url.toString(), { headers })
      
      if (!response.ok) throw new Error("Failed to fetch file")
        
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = name || "cv-espejo.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cleanup the object URL
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 100)
    } catch (error) {
      console.error("Download fallback to new tab:", error)
      toast({
        title: "No pudimos descargar el CV",
        description: "Intentaremos abrirlo en una nueva pestaña.",
      })
      window.open(getCvDownloadUrl(id), "_blank")
    }
  }


  async function handleSave() {
    setIsSaving(true)
    try {
      if (user?.name !== profile.name) {
        await updateUserName(profile.name)
      }

      await updatePreferences({
         ...(user?.prefs || {}),
         title: profile.title,
         avatarUrl: profile.avatarUrl,
      })

      // Disable dirty state and refresh session
      setIsDirty(false)
      await refreshUser()
    } catch (error) {
      console.error("Failed to update profile", error)
      toast({
        title: "No pudimos guardar la configuración",
        description: "Intenta nuevamente en unos instantes.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  function handleDiscard() {
    if (user) {
      const prefs = user.prefs as Record<string, any>
      setProfile({
        name: user.name || "",
        email: user.email || "",
        title: prefs?.title || "",
        avatarUrl: prefs?.avatarUrl || "",
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
          twoFactorEnabled={twoFactorEnabled}
          onChangePassword={() => console.log("Change password not implemented")}
          onToggle2FA={() => console.log("Toggle 2FA not implemented")}
        />
      </div>

      {/* Footer Actions */}
      <footer className="mt-20 flex justify-end gap-4 border-t border-ec-outline-variant/15 pt-10 animate-fade-in-up delay-300">
        <Button
          type="button"
          variant="ghost"
          onClick={handleDiscard}
          disabled={!isDirty || isSaving || isUploading}
          className="rounded-xl px-8 text-sm font-semibold text-ec-on-surface-variant"
        >
          Descartar Cambios
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving || isUploading}
          className="rounded-xl px-10 text-sm font-bold gap-2"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          Guardar Configuración
        </Button>
      </footer>
    </main>
  )
}

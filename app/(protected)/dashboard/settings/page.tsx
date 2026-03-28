"use client"

import { useToast } from "@/components/ui/toast"
import {
  SettingsProfile,
  SettingsCvManager,
  SettingsPracticeHistory,
} from "@/components/settings"
import { useSettings } from "@/hooks/useSettings"

export default function Settings() {
  const { toast } = useToast()
  const {
    user,
    isCheckingAuth,
    cvList,
    isLoadingCvs,
    practiceHistory,
    isLoadingHistory,
    isUpdatingName,
    isHidingCv,
    isUploadingCv,
    updateName,
    hideCv,
    uploadCv,
  } = useSettings()

  return (
    <main className="min-h-svh overflow-y-auto px-6 py-8 md:px-10">
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-widest text-ec-primary uppercase">
            Configuración
          </p>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-ec-on-surface text-glow">
            Tu cuenta
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-ec-on-surface-variant">
            Administra tu información personal, gestiona tus CVs y revisa las
            ofertas de trabajo con las que has practicado.
          </p>
        </div>

        {/* Profile section */}
        <SettingsProfile
          user={user}
          isUpdatingName={isUpdatingName}
          onUpdateName={updateName}
        />

        {/* CV manager section */}
        <SettingsCvManager
          cvList={cvList}
          isLoading={isLoadingCvs}
          isHidingCv={isHidingCv}
          isUploadingCv={isUploadingCv}
          onHideCv={hideCv}
          onUploadCv={uploadCv}
          onToast={toast}
        />

        {/* Practice history section */}
        <SettingsPracticeHistory
          entries={practiceHistory}
          isLoading={isLoadingHistory}
        />
      </div>
    </main>
  )
}
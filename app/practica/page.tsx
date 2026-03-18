import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import {
  InterviewHeader,
  InterviewerPanel,
  ConversationStream,
  ResponseBar,
} from "@/components/practice"

export const metadata = {
  title: "Práctica — espejoCV",
  description:
    "Simulación de entrevista en curso. Practica con un entrevistador IA para prepararte para tu próximo rol.",
}

export default function PracticaPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pt-24 pb-48">
        <div className="mx-auto max-w-7xl">
          <InterviewHeader />

          {/* Interview interaction grid */}
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            <InterviewerPanel />
            <ConversationStream />
          </div>
        </div>
      </main>

      {/* Fixed bottom input bar */}
      <ResponseBar />

      <Footer />
    </>
  )
}

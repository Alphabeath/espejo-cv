import { Navbar, Hero, FeaturesBento, Testimonial, Footer } from "@/components/landing"
import { Separator } from "@/components/ui/separator"

export default function Page() {
  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(168,166,255,0.18),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(174,215,255,0.18),_transparent_26%)]">
      <Navbar />
      <main className="min-h-screen pt-24">
        <Hero />
        <Separator className="mx-auto max-w-7xl bg-ec-outline-variant/40" />
        <FeaturesBento />
        <Separator className="mx-auto max-w-7xl bg-ec-outline-variant/40" />
        <Testimonial />
      </main>
      <Footer />
    </div>
  )
}

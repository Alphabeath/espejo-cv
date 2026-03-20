import { Navbar, Hero, FeaturesBento, Testimonial, Footer } from "@/components/landing"

export default function Page() {
  return (
    <div className="quiet-shell relative overflow-hidden">
      <Navbar />
      <main className="min-h-screen pt-24">
        <Hero />
        <FeaturesBento />
        <Testimonial />
      </main>
      <Footer />
    </div>
  )
}

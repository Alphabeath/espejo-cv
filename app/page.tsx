import {
  Navbar,
  Hero,
  HowItWorks,
  FeaturesBento,
  Testimonial,
  CallToAction,
  Footer,
} from "@/components/landing"

export default function Page() {
  return (
    <div className="quiet-shell relative overflow-hidden">
      <Navbar />
      <main className="min-h-screen pt-24">
        <Hero />
        <HowItWorks />
        <FeaturesBento />
        <Testimonial />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

import Link from "next/link"

const footerLinks = [
  { label: "Política de Privacidad", href: "#" },
  { label: "Términos de Servicio", href: "#" },
  { label: "Soporte", href: "#" },
]

export function Footer() {
  return (
    <footer className="w-full bg-ec-surface-container-low py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-12 md:flex-row md:gap-0">
        <div className="text-xs tracking-wide text-ec-on-surface-variant">
          © {new Date().getFullYear()} espejoCV Interview Systems
        </div>

        <div className="flex gap-8">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs tracking-wide text-ec-on-surface-variant underline underline-offset-4 transition-colors hover:text-ec-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

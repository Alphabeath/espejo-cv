"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/useAuth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (!error) {
      return
    }

    toast({
      title: "No pudimos iniciar sesión",
      description: error,
    })
    clearError()
  }, [clearError, error, toast])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await login({ email, password })
      router.replace(searchParams.get("redirectTo") || "/dashboard")
    } catch {
      return
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="quiet-surface bg-ec-surface-container-lowest">
        <CardHeader className="space-y-3 pb-2">
          <CardTitle>Inicia sesión</CardTitle>
          <CardDescription className="max-w-md text-ec-on-surface-variant">
            Estás a un paso de dominar tus entrevistas. Ingresa tus credenciales para comenzar tu viaje hacia el éxito profesional.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm text-ec-on-surface-variant underline-offset-4 hover:text-ec-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex flex-col gap-3">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={async () => {
                      setEmail("midudev@dev.com")
                      setPassword("12345678")
                      try {
                        await login({ email: "midudev@dev.com", password: "12345678" })
                        router.replace(searchParams.get("redirectTo") || "/dashboard")
                      } catch {
                        // Error handled by useAuth hook
                      }
                    }}
                    className="border-ec-primary text-ec-primary hover:bg-ec-primary/10 transition-colors"
                  >
                    Entrar con cuenta Demo
                  </Button>
                </div>
                <FieldDescription className="text-center text-ec-on-surface-variant mt-2">
                  ¿No tienes una cuenta? <Link href="/auth/register">Regístrate</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

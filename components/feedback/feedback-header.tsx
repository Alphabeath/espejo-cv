export function FeedbackHeader() {
  return (
    <header className="mb-16 md:mb-24">
      <h1
        className="mb-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-ec-on-surface md:text-6xl"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        ¡Excelente trabajo! Aquí tienes tu resumen de desempeño.
      </h1>
      <p className="max-w-2xl text-lg text-ec-on-surface-variant">
        Hemos analizado tu simulación basándonos en 42 competencias clave. Tu
        nivel de autoridad es sólido, con oportunidades específicas para pulir
        tu comunicación no verbal.
      </p>
    </header>
  )
}

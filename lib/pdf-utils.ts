import * as pdfjsLib from "pdfjs-dist"

// Configura el worker de pdf.js para que cargue desde el CDN.
// Esto evita tener que copiar el worker al directorio public.
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
}

/**
 * Extrae el texto plano de un archivo PDF en el cliente.
 *
 * Lee todas las páginas y concatena el contenido textual.
 * Útil para enviar el contenido del CV como contexto al LLM.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
    pages.push(pageText)
  }

  return pages.join("\n\n")
}

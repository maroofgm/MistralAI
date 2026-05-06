export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { chatWithFallback } from '@/lib/openai'
import path from 'node:path'

const SYSTEM_PROMPT = `You are a CV/resume parser. Extract personal information from the provided CV text and return it as a JSON object with these exact keys (use null for missing or unclear fields):
- first_name (string)
- last_name (string)
- dob (string in ISO 8601 format YYYY-MM-DD, e.g. "1990-05-15")
- birth_place (string, country or city)
- add_1 (string, street address line 1)
- add_2 (string, apartment/suite or null)
- zip_code (number, postal/zip code as a number)
- profession (string, job title or occupation)
- age (number, integer)
- salary (number, annual salary as integer, infer from context if mentioned)

Return ONLY the JSON object, no explanation, no markdown.`

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx']

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase()
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Use node: prefix on both imports to guarantee Node.js built-ins,
  // preventing webpack from substituting browser polyfills
  const { pathToFileURL } = await import('node:url')
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

  const workerPath = path.resolve(
    process.cwd(),
    'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
  )
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
  const pdfDoc = await loadingTask.promise
  const pages: string[] = []

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }

  return pages.join('\n').trim()
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value.trim()
}

async function extractTextFromXlsx(buffer: Buffer): Promise<string> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const lines: string[] = []
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    if (csv.trim()) lines.push(csv.trim())
  }
  return lines.join('\n').trim()
}

async function extractText(buffer: Buffer, ext: string): Promise<string> {
  if (ext === '.pdf') return extractTextFromPdf(buffer)
  if (ext === '.docx') return extractTextFromDocx(buffer)
  if (ext === '.xlsx') return extractTextFromXlsx(buffer)
  // .txt, .md, .csv — plain UTF-8
  return buffer.toString('utf-8').trim()
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = getExtension(file.name)
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type. Accepted formats: ${ACCEPTED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 10 MB' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const pdfText = await extractText(buffer, ext)

    if (!pdfText) {
      return NextResponse.json(
        { error: 'Could not extract text from the file. Make sure it contains readable text.' },
        { status: 422 }
      )
    }

    const completion = await chatWithFallback(
      'llama-3.3-70b-versatile',
      'gpt-4o',
      {
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Here is the CV text:\n\n${pdfText.slice(0, 8000)}` },
        ],
        temperature: 0.1,
      }
    )

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return NextResponse.json({ error: 'OpenAI returned an empty response' }, { status: 500 })
    }

    const extracted = JSON.parse(raw)
    return NextResponse.json({ data: extracted })
  } catch (err) {
    console.error('[extract-cv]', err)
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

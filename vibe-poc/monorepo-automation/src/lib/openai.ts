import OpenAI from 'openai'

// Free — used first
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

// Paid — fallback when Groq quota exhausted
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type NonStreamParams = Omit<
  Parameters<typeof openai.chat.completions.create>[0],
  'model' | 'stream'
>

// Try Groq first; on 429 (quota exhausted) fall back to OpenAI
export async function chatWithFallback(
  groqModel: string,
  openaiModel: string,
  params: NonStreamParams
) {
  try {
    return await groq.chat.completions.create({ ...params, model: groqModel, stream: false })
  } catch (err) {
    if (err instanceof OpenAI.RateLimitError) {
      console.warn('[llm] Groq quota exhausted — falling back to OpenAI')
      return await openai.chat.completions.create({ ...params, model: openaiModel, stream: false })
    }
    throw err
  }
}

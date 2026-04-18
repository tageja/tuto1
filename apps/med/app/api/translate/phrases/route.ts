import { NextRequest, NextResponse } from 'next/server'

async function translateEnToVi(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return ''
    const data = await res.json() as { responseData?: { translatedText?: string }; responseStatus?: number }
    const translated = data.responseData?.translatedText
    if (!translated || translated === text || data.responseStatus === 403) return ''
    return translated
  } catch {
    return ''
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function POST(req: NextRequest) {
  try {
    const { phrases } = await req.json() as { phrases: string[] }

    if (!Array.isArray(phrases) || phrases.length === 0) {
      return NextResponse.json({ error: 'phrases array required' }, { status: 400 })
    }

    if (phrases.length > 40) {
      return NextResponse.json({ error: 'Max 40 phrases per request' }, { status: 400 })
    }

    const pairs: { en: string; vi: string }[] = []

    for (let i = 0; i < phrases.length; i++) {
      const en = phrases[i].trim()
      if (!en) continue
      const vi = await translateEnToVi(en)
      pairs.push({ en, vi })
      if (i < phrases.length - 1) await delay(300)
    }

    return NextResponse.json({ pairs })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

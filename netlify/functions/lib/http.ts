export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'cache-control': 'no-store' } })

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') throw new Error('not object')
    return body as T
  } catch {
    throw new HttpError(400, 'Request body must be a JSON object.')
  }
}

// Input helpers: every value from the browser is untrusted and normalized here.
export const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
export const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v))
export const int = (v: unknown, fallback: number) => {
  const n = Math.trunc(Number(v))
  return Number.isFinite(n) ? n : fallback
}
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

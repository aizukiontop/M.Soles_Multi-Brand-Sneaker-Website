// Thin fetch wrapper for the /api/* Netlify Function. Session cookies are sent automatically (same origin).
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T = unknown>(path: string, init: Omit<RequestInit, 'body'> & { json?: unknown; body?: BodyInit } = {}): Promise<T> {
  const headers = new Headers(init.headers)
  let body: BodyInit | undefined = init.body
  if (init.json !== undefined) {
    headers.set('content-type', 'application/json')
    body = JSON.stringify(init.json)
  }
  const res = await fetch(`/api${path}`, { ...init, headers, body, credentials: 'same-origin' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError((data as { error?: string }).error || 'Something went wrong. Please try again.', res.status)
  return data as T
}

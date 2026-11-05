import { getStore } from '@netlify/blobs'
import { HttpError, json } from './http.js'
import { requireAdmin } from './auth.js'

const STORE_NAME = 'product-images'
const MAX_BYTES = 4 * 1024 * 1024
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

// POST /api/admin/upload  (raw image body, Content-Type set to the image MIME type)
export async function uploadImage(req: Request) {
  await requireAdmin()
  const type = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  const ext = TYPES[type]
  if (!ext) throw new HttpError(415, 'Upload a JPG, PNG or WebP image.')
  const bytes = await req.arrayBuffer()
  if (bytes.byteLength === 0) throw new HttpError(400, 'The uploaded file is empty.')
  if (bytes.byteLength > MAX_BYTES) throw new HttpError(413, 'Images must be 4 MB or smaller.')

  const key = `${crypto.randomUUID()}.${ext}`
  await getStore(STORE_NAME).set(key, bytes, { metadata: { contentType: type } })
  return json({ url: `/api/images/${key}` }, 201)
}

// GET /api/images/:key  (public: product photos are shown to every visitor)
export async function serveImage(key: string) {
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key)) throw new HttpError(404, 'Image not found.')
  const result = await getStore(STORE_NAME).getWithMetadata(key, { type: 'arrayBuffer' })
  if (!result) throw new HttpError(404, 'Image not found.')
  const contentType = (result.metadata?.contentType as string) || 'application/octet-stream'
  return new Response(result.data, {
    headers: { 'content-type': contentType, 'cache-control': 'public, max-age=31536000, immutable' },
  })
}

import { getStore } from '@netlify/blobs'
import { eq } from 'drizzle-orm'
import { db } from '../../../db/index.js'
import { profiles } from '../../../db/schema.js'
import { HttpError, json } from './http.js'
import { requireUser } from './auth.js'

const STORE_NAME = 'avatars'
const MAX_BYTES = 2 * 1024 * 1024
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const KEY_RE = /^[a-f0-9-]{36}\.(jpg|png|webp)$/

// Blob key from a stored avatar URL, or null when the profile has no avatar.
const keyFromUrl = (url: string | null) => (url ? url.split('/').pop() ?? null : null)

// POST /api/me/avatar  (raw image body, Content-Type set to the image MIME type)
export async function uploadAvatar(req: Request) {
  const user = await requireUser()
  const type = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  const ext = TYPES[type]
  if (!ext) throw new HttpError(415, 'Upload a JPG, PNG or WebP image.')
  const bytes = await req.arrayBuffer()
  if (bytes.byteLength === 0) throw new HttpError(400, 'The uploaded file is empty.')
  if (bytes.byteLength > MAX_BYTES) throw new HttpError(413, 'Profile photos must be 2 MB or smaller.')

  const store = getStore(STORE_NAME)
  const key = `${crypto.randomUUID()}.${ext}`
  await store.set(key, bytes, { metadata: { contentType: type } })

  const [profile] = await db.select({ avatarUrl: profiles.avatarUrl }).from(profiles).where(eq(profiles.id, user.id)).limit(1)
  const avatarUrl = `/api/avatars/${key}`
  await db.update(profiles).set({ avatarUrl }).where(eq(profiles.id, user.id))

  const previous = keyFromUrl(profile?.avatarUrl ?? null)
  if (previous && KEY_RE.test(previous)) await store.delete(previous)
  return json({ avatarUrl }, 201)
}

// DELETE /api/me/avatar  (reverts to the initial-letter avatar)
export async function removeAvatar() {
  const user = await requireUser()
  const [profile] = await db.select({ avatarUrl: profiles.avatarUrl }).from(profiles).where(eq(profiles.id, user.id)).limit(1)
  await db.update(profiles).set({ avatarUrl: null }).where(eq(profiles.id, user.id))
  const previous = keyFromUrl(profile?.avatarUrl ?? null)
  if (previous && KEY_RE.test(previous)) await getStore(STORE_NAME).delete(previous)
  return json({ avatarUrl: null })
}

// GET /api/avatars/:key  (public: profile photos are shown on the account page only for their owner, but the URL is unguessable)
export async function serveAvatar(key: string) {
  if (!KEY_RE.test(key)) throw new HttpError(404, 'Image not found.')
  const result = await getStore(STORE_NAME).getWithMetadata(key, { type: 'arrayBuffer' })
  if (!result) throw new HttpError(404, 'Image not found.')
  const contentType = (result.metadata?.contentType as string) || 'application/octet-stream'
  return new Response(result.data, {
    headers: { 'content-type': contentType, 'cache-control': 'public, max-age=86400' },
  })
}

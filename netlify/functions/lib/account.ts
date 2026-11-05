import { and, eq } from 'drizzle-orm'
import { db } from '../../../db/index.js'
import { addresses, profiles } from '../../../db/schema.js'
import { HttpError, json, readJson, str } from './http.js'
import { requireUser, isAdminUser } from './auth.js'

const PHONE_RE = /^\+?[0-9][0-9\s-]{6,18}$/

function parseAddress(body: Record<string, unknown>) {
  const errors: string[] = []
  const v = {
    recipientName: str(body.recipientName, 100),
    phone: str(body.phone, 25),
    addressLine: str(body.addressLine, 200),
    city: str(body.city, 80),
    province: str(body.province, 80),
    postalCode: str(body.postalCode, 10),
  }
  if (v.recipientName.length < 2) errors.push('Recipient name is required.')
  if (!PHONE_RE.test(v.phone)) errors.push('Enter a valid phone number.')
  if (v.addressLine.length < 5) errors.push('Address is required.')
  if (!v.city) errors.push('City is required.')
  if (!v.province) errors.push('Province is required.')
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(v.postalCode)) errors.push('Enter a valid postal code.')
  if (errors.length) throw new HttpError(422, errors.join(' '))
  return { ...v, isDefault: body.isDefault === true }
}

// GET/PUT /api/me
export async function getMe(req: Request) {
  const user = await requireUser()
  const profile = (await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1))[0]
  return json({
    id: user.id,
    email: user.email ?? profile?.email ?? '',
    fullName: profile?.fullName ?? user.name ?? '',
    phone: profile?.phone ?? '',
    avatarUrl: profile?.avatarUrl ?? null,
    isAdmin: isAdminUser(user),
  })
}

export async function updateMe(req: Request) {
  const user = await requireUser()
  const body = await readJson(req)
  const fullName = str(body.fullName, 100)
  const phone = str(body.phone, 25)
  if (fullName.length < 2) throw new HttpError(422, 'Full name must be at least 2 characters.')
  if (phone && !PHONE_RE.test(phone)) throw new HttpError(422, 'Enter a valid phone number.')
  await db.update(profiles).set({ fullName, phone: phone || null }).where(eq(profiles.id, user.id))
  return getMe(req)
}

// GET /api/addresses, POST /api/addresses
export async function listAddresses() {
  const user = await requireUser()
  const rows = await db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(addresses.id)
  return json({ items: rows })
}

export async function createAddress(req: Request) {
  const user = await requireUser()
  const input = parseAddress(await readJson(req))
  const existing = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, user.id)).limit(1)
  const makeDefault = input.isDefault || existing.length === 0
  const row = await db.transaction(async (tx) => {
    if (makeDefault) await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id))
    const [created] = await tx.insert(addresses).values({ ...input, isDefault: makeDefault, userId: user.id }).returning()
    return created
  })
  return json({ item: row }, 201)
}

export async function updateAddress(id: number, req: Request) {
  const user = await requireUser()
  const input = parseAddress(await readJson(req))
  const row = await db.transaction(async (tx) => {
    const [owned] = await tx.select({ id: addresses.id }).from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, user.id))).limit(1)
    if (!owned) throw new HttpError(404, 'Address not found.')
    if (input.isDefault) await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id))
    const [updated] = await tx.update(addresses).set(input)
      .where(eq(addresses.id, id)).returning()
    return updated
  })
  return json({ item: row })
}

export async function deleteAddress(id: number) {
  const user = await requireUser()
  const [removed] = await db.delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id))).returning()
  if (!removed) throw new HttpError(404, 'Address not found.')
  return json({ ok: true })
}


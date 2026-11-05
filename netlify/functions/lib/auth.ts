import { getUser, type User } from '@netlify/identity'
import { eq } from 'drizzle-orm'
import { db } from '../../../db/index.js'
import { profiles } from '../../../db/schema.js'
import { HttpError } from './http.js'

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getUser>>>

// Resolves the signed-in Identity user from the session cookie, validated by Netlify Identity.
// Also makes sure a profile row exists so foreign keys from cart/orders/addresses always resolve.
export async function requireUser(): Promise<CurrentUser> {
  const user = await getUser()
  if (!user) throw new HttpError(401, 'Please sign in to continue.')
  await db
    .insert(profiles)
    .values({ id: user.id, email: user.email ?? '', fullName: user.name ?? null })
    .onConflictDoNothing({ target: profiles.id })
  return user
}

// Roles come from app_metadata, which only Identity admins and event functions can write.
export function isAdminUser(user: Pick<User, 'roles'> | null | undefined) {
  return Boolean(user?.roles?.includes('admin'))
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser()
  if (!isAdminUser(user)) throw new HttpError(403, 'Admin access required.')
  return user
}

export async function getProfile(userId: string) {
  const [row] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1)
  return row ?? null
}

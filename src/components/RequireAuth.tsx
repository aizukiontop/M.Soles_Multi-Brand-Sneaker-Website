import { Navigate, useLocation } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

// UI guard only. Every protected API route re-checks the session on the server.
export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner label="Checking your session…" />
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  if (admin && !isAdmin) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="h-display text-4xl">Access denied</h1>
        <p className="text-mute mt-4">This area is restricted to M.Soles administrators.</p>
      </div>
    )
  }
  return <>{children}</>
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="py-24 grid place-items-center gap-4 text-mute text-sm" role="status">
      <span className="size-8 border-2 border-line border-t-accent rounded-full animate-spin" />
      {label && <p>{label}</p>}
    </div>
  )
}

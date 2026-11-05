import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getUser, onAuthChange, handleAuthCallback, login, signup, logout, oauthLogin,
  requestPasswordRecovery, updateUser, getSettings, type User,
} from '@netlify/identity'

type AuthCtx = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  googleEnabled: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>
  signInWithGoogle: (next?: string) => void
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  setNewPassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthCtx>(null!)

// handleAuthCallback consumes the URL hash once; share one promise so React StrictMode double-mounts are safe.
let callbackPromise: ReturnType<typeof handleAuthCallback> | null = null
const runCallback = () => (callbackPromise ??= handleAuthCallback())

export const NEXT_KEY = 'nx-auth-next'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    let active = true
    const off = onAuthChange((_event, u) => { if (active) setUser(u ?? null) })

    ;(async () => {
      try {
        const result = await runCallback()
        if (result?.type === 'recovery') {
          // Recovery links sign the user in; send them to the set-password form.
          window.location.replace('/reset-password')
          return
        }
        if (result && result.user) {
          const next = sessionStorage.getItem(NEXT_KEY)
          sessionStorage.removeItem(NEXT_KEY)
          if (next && next.startsWith('/')) window.location.replace(next)
        }
      } catch (err) {
        console.error('Auth callback failed', err)
      }
      try {
        const current = await getUser()
        if (active) setUser(current)
      } finally {
        if (active) setLoading(false)
      }
    })()

    getSettings()
      .then((s) => { if (active) setGoogleEnabled(Boolean(s.providers.google)) })
      .catch(() => { if (active) setGoogleEnabled(false) })

    return () => { active = false; off?.() }
  }, [])

  const value: AuthCtx = {
    user,
    loading,
    isAdmin: Boolean(user?.roles?.includes('admin')),
    googleEnabled,
    signIn: async (email, password) => {
      const u = await login(email, password)
      setUser(u)
    },
    signUp: async (email, password, fullName) => {
      const u = await signup(email, password, { full_name: fullName })
      // With email confirmation on, Identity returns the user without a confirmedAt timestamp and no session.
      const confirmed = Boolean(u.confirmedAt)
      if (confirmed) setUser(u)
      return { needsConfirmation: !confirmed }
    },
    signInWithGoogle: (next) => {
      sessionStorage.setItem(NEXT_KEY, next || '/account')
      oauthLogin('google')
    },
    signOut: async () => {
      await logout()
      setUser(null)
    },
    sendPasswordReset: async (email) => {
      await requestPasswordRecovery(email)
    },
    setNewPassword: async (password) => {
      await updateUser({ password })
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

import { Link, useNavigate, useSearchParams } from 'react-router'
import { useEffect, useState } from 'react'
import { Logo, Modal } from '../ui'
import { IMG, u } from '../data'
import { useAuth } from '../context/AuthContext'
import { authErrorMessage } from '../services/auth'
import { getUser, updateUser } from '@netlify/identity'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

// Only same-site relative paths may be used as a post-login destination.
const safeNext = (raw: string | null) => (raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account')

export function AuthPage({ mode }: { mode: Exclude<AuthMode, 'reset'> }) {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const { user, loading, signIn, signUp, sendPasswordReset, signInWithGoogle, googleEnabled } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  // Already signed in: go to the destination.
  useEffect(() => { if (!loading && user && mode !== 'forgot') nav(next, { replace: true }) }, [user, loading, mode, next, nav])

  const content: Record<AuthMode, [string, string, string]> = {
    login: ['Welcome back', 'Log in to track orders and check out faster.', 'Log in'],
    register: ['Join the vault', 'Create an account for early drops and member pricing.', 'Create account'],
    forgot: ['Reset password', "Enter your email and we'll send a reset link.", 'Send reset link'],
    reset: ['Set a new password', 'Choose a new password for your account.', 'Save password'],
  }
  const [heading, subtext, cta] = content[mode]

  const validate = () => {
    if (mode === 'register' && name.trim().length < 2) return 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return 'Please enter a valid email address.'
    if (mode !== 'forgot' && password.length < 6) return 'Password must be at least 6 characters.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setNotice(null)
    const problem = validate()
    if (problem) { setError(problem); return }
    setBusy(true)
    try {
      if (mode === 'forgot') {
        await sendPasswordReset(email.trim())
        setResetSent(true)
      } else if (mode === 'login') {
        await signIn(email.trim(), password)
        nav(next, { replace: true })
      } else if (mode === 'register') {
        const { needsConfirmation } = await signUp(email.trim(), password, name.trim())
        if (needsConfirmation) setNotice('Account created. Check your email and click the confirmation link to finish signing in.')
        else nav(next, { replace: true })
      }
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-110px)] grid lg:grid-cols-2">
      {/* Left — lifestyle image (desktop only) */}
      <div className="relative max-lg:hidden">
        <img src={u(IMG.hero, 1400)} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/70 to-black/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="h-display text-5xl">Every brand.<br />One vault.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="grid place-items-center p-6 py-16">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm">
          <Logo className="mb-10" />
          <h1 className="h-display text-3xl">{heading}</h1>
          <p className="text-mute text-sm mt-3 mb-8">{subtext}</p>

          {error && <p role="alert" className="mb-5 border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3">{error}</p>}
          {notice && <p role="status" className="mb-5 border border-green-500/40 bg-green-500/10 text-green-300 text-sm px-4 py-3">{notice}</p>}

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label" htmlFor="auth-name">Full name</label>
                <input id="auth-name" autoComplete="name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label className="label" htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between">
                  <label className="label" htmlFor="auth-password">Password</label>
                  {mode === 'login' && <Link to="/forgot-password" className="text-xs text-accent2">Forgot?</Link>}
                </div>
                <input id="auth-password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
          </div>

          <button disabled={busy} className="btn-primary w-full mt-8">{busy ? 'Please wait…' : cta}</button>

          {mode !== 'forgot' && googleEnabled && (
            <>
              <div className="flex items-center gap-4 my-6 text-xs text-mute">
                <span className="h-px flex-1 bg-line" /> OR <span className="h-px flex-1 bg-line" />
              </div>
              <button type="button" onClick={() => signInWithGoogle(next)} className="btn-ghost w-full">
                Continue with Google
              </button>
            </>
          )}

          <p className="text-sm text-mute text-center mt-8">
            {mode === 'login' ? (
              <>New here? <Link to={`/register?next=${encodeURIComponent(next)}`} className="text-white underline">Create account</Link></>
            ) : (
              <>Back to <Link to="/login" className="text-white underline">log in</Link></>
            )}
          </p>
        </form>
      </div>

      <Modal open={resetSent} onClose={() => setResetSent(false)}>
        <h3 className="h-display text-xl">Check your inbox</h3>
        <p className="text-mute mt-2 mb-6">If an account exists for that email, a reset link is on its way.</p>
        <button className="btn-primary w-full" onClick={() => { setResetSent(false); nav('/login') }}>Back to login</button>
      </Modal>
    </div>
  )
}

// Destination of the password-recovery email. The recovery link has already signed the user in.
export function ResetPasswordPage() {
  const nav = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    getUser().then((u) => setHasSession(Boolean(u))).finally(() => setChecking(false))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    try {
      await updateUser({ password })
      setDone(true)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-110px)] grid place-items-center p-6 py-16">
      <div className="w-full max-w-sm">
        <Logo className="mb-10" />
        <h1 className="h-display text-3xl">Set a new password</h1>
        {checking ? (
          <p className="text-mute text-sm mt-6">Checking your reset link…</p>
        ) : !hasSession ? (
          <>
            <p className="text-mute text-sm mt-3 mb-8">This reset link is invalid or has expired. Request a new one.</p>
            <Link to="/forgot-password" className="btn-primary w-full">Request new link</Link>
          </>
        ) : done ? (
          <>
            <p className="text-mute text-sm mt-3 mb-8">Your password has been updated.</p>
            <button className="btn-primary w-full" onClick={() => nav('/account')}>Go to my account</button>
          </>
        ) : (
          <form onSubmit={submit} noValidate className="mt-3 space-y-4">
            {error && <p role="alert" className="border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3">{error}</p>}
            <div>
              <label className="label" htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="confirm-password">Confirm</label>
              <input id="confirm-password" type="password" autoComplete="new-password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button disabled={busy} className="btn-primary w-full">{busy ? 'Saving…' : 'Save password'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

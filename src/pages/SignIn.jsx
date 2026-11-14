import { CircleAlert, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import * as api from '../lib/api.js'
import { authMessage } from '../lib/errors.js'
import { safeNext } from '../lib/paths.js'

// Supabase allows one code request per address every 60 seconds.
const COOLDOWN = 60

function SignIn() {
  const { user, loading } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = safeNext(params.get('next'))

  const [step, setStep] = useState('email') // 'email', then 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [wait, setWait] = useState(0) // seconds until Resend is allowed again

  useEffect(() => {
    if (wait <= 0) return
    const timer = setTimeout(() => setWait(wait - 1), 1000)
    return () => clearTimeout(timer)
  }, [wait])

  if (loading) {
    return (
      <div className="center-screen" role="status" aria-label="Loading">
        <div className="spinner" />
      </div>
    )
  }

  // Already signed in and just landed here. `busy` is checked so this doesn't
  // fire in the middle of verifying a code, when the redirect below it decides
  // where to go instead.
  if (user && !busy) return <Navigate to={next ?? '/browse'} replace />

  async function send(event) {
    event?.preventDefault()
    const clean = email.trim().toLowerCase()
    setError('')
    setNote('')

    // Only for a faster, friendlier message. The real rule is enforced by the
    // database hook, which this check can't replace.
    if (!/^[^\s@]+@wisc\.edu$/.test(clean)) {
      setError('MadLease is for UW–Madison students. Use your @wisc.edu email.')
      return
    }

    setBusy(true)
    try {
      await api.sendCode(clean)
      setEmail(clean)
      if (step === 'code') setNote('A new code is on its way.')
      setStep('code')
      setWait(COOLDOWN)
    } catch (err) {
      setError(authMessage(err))
    }
    setBusy(false)
  }

  async function verify(event) {
    event.preventDefault()
    setError('')
    setNote('')
    setBusy(true)

    let signedIn
    try {
      signedIn = (await api.verifyCode(email, code)).user
    } catch (err) {
      setError(authMessage(err))
      setBusy(false)
      return
    }

    // New students have no name yet, so they finish their profile first. If
    // the profile can't be read, don't block them: carry on to where they
    // were going.
    let named = true
    try {
      const profile = await api.fetchProfile(signedIn.id)
      named = Boolean(profile?.full_name)
    } catch {
      named = true
    }

    if (named) {
      navigate(next ?? '/browse', { replace: true })
    } else {
      const onward = next ? `&next=${encodeURIComponent(next)}` : ''
      navigate(`/profile?welcome=1${onward}`, { replace: true })
    }
  }

  return (
    <div className="page page-narrow">
      <div className="card signin">
        <h1>Sign in to MadLease</h1>

        {step === 'email' ? (
          <form onSubmit={send} noValidate>
            <p className="muted">
              Enter your UW email and we'll send you a one-time code. No password, and signing in for the first time
              creates your account.
            </p>
            <div className="field">
              <label className="label" htmlFor="email">
                UW email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="netid@wisc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby="email-hint"
                aria-invalid={error ? 'true' : undefined}
                autoFocus
                required
              />
              <span className="hint" id="email-hint">
                Only @wisc.edu addresses can sign in.
              </span>
            </div>
            {error && (
              <p className="note note-error" role="alert">
                <CircleAlert aria-hidden="true" />
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Sending…' : 'Email me a code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} noValidate>
            <p className="note">
              <MailCheck aria-hidden="true" />
              <span>
                We sent a code to <strong>{email}</strong>. It can take a minute to arrive, and it may land in junk.
              </span>
            </p>
            <div className="field">
              <label className="label" htmlFor="code">
                Code from the email
              </label>
              <input
                id="code"
                className="input signin-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6,10}"
                maxLength={10}
                value={code}
                // Codes are digits only, so drop anything else (pasted spaces, dashes).
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                aria-invalid={error ? 'true' : undefined}
                autoFocus
                required
              />
            </div>
            {error && (
              <p className="note note-error" role="alert">
                <CircleAlert aria-hidden="true" />
                {error}
              </p>
            )}
            {note && (
              <p className="hint" role="status">
                {note}
              </p>
            )}
            {/* 6 to 10 digits: Supabase projects can be set to send either length. */}
            <button type="submit" className="btn btn-primary btn-block" disabled={busy || code.length < 6}>
              {busy ? 'Checking…' : 'Sign in'}
            </button>
            <div className="signin-links">
              <button type="button" className="link" onClick={() => send()} disabled={busy || wait > 0}>
                {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
              </button>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError('')
                  setNote('')
                }}
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default SignIn

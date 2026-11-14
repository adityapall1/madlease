import { CircleAlert } from 'lucide-react'

// Shown instead of the app when the Supabase settings are missing. Without them
// every page would fail in its own confusing way, so stop here and say why.
function MissingEnv() {
  return (
    <main className="page page-narrow">
      <div className="empty">
        <CircleAlert aria-hidden="true" />
        <h1>MadLease isn't set up yet</h1>
        <p>
          The site can't reach its database because <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> are not set.
        </p>
        <p>
          Running locally? Copy <code>.env.example</code> to <code>.env.local</code>, fill in both values, and
          restart <code>npm run dev</code>. The README has the full setup steps.
        </p>
      </div>
    </main>
  )
}

export default MissingEnv

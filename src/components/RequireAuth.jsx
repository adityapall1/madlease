import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import { signInPath } from '../lib/paths.js'

// Wraps pages that need an account. Signed-out visitors are sent to sign in
// and brought back to this same page afterwards.
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Wait until we know. Redirecting early would bounce signed-in users to the
  // sign-in page every time they reload.
  if (loading) {
    return (
      <div className="center-screen" role="status" aria-label="Loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <Navigate to={signInPath(location)} replace />
  return children
}

export default RequireAuth

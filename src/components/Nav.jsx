import { Plus } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import { signInPath } from '../lib/paths.js'
import AvatarMenu from './AvatarMenu.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { Button } from './ui/button.jsx'

function Nav() {
  const location = useLocation()
  const { user, loading } = useAuth()

  // Where "Sign in" should bring someone back to. From the landing or sign-in
  // page there is nowhere useful to return to, so let sign-in pick.
  const plain = location.pathname === '/' || location.pathname === '/signin'

  return (
    <header className="nav">
      <Link to="/" className="nav-logo" aria-label="MadLease home">
        <span className="nav-wordmark" aria-hidden="true" />
      </Link>

      <nav aria-label="Main">
        <NavLink to="/browse" className="nav-link">
          Browse
        </NavLink>
      </nav>

      <div className="nav-right">
        <Button asChild size="sm"><Link to="/listings/new" className="nav-post" aria-label="Post a sublease">
          <Plus aria-hidden="true" />
          <span>Post a sublease</span>
        </Link></Button>
        <ThemeToggle />
        {/* Nothing is shown until we know, so "Sign in" doesn't flash at
            someone who is already signed in. */}
        {loading ? null : user ? (
          <AvatarMenu />
        ) : (
          <Button asChild variant="outline" size="sm"><Link to={plain ? '/signin' : signInPath(location)}>
            Sign in
          </Link></Button>
        )}
      </div>
    </header>
  )
}

export default Nav

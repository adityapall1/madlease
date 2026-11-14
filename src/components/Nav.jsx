import { MapPin, Plus } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { signInPath } from '../lib/paths.js'
import ThemeToggle from './ThemeToggle.jsx'

function Nav() {
  const location = useLocation()

  return (
    <header className="nav">
      <Link to="/" className="nav-logo">
        <MapPin aria-hidden="true" />
        MadLease
      </Link>

      <nav aria-label="Main">
        <NavLink to="/browse" className="nav-link">
          Browse
        </NavLink>
      </nav>

      <div className="nav-right">
        <Link to="/listings/new" className="btn btn-primary btn-sm nav-post" aria-label="Post a sublease">
          <Plus aria-hidden="true" />
          <span>Post a sublease</span>
        </Link>
        <ThemeToggle />
        <Link to={signInPath(location)} className="btn btn-outline btn-sm">
          Sign in
        </Link>
      </div>
    </header>
  )
}

export default Nav

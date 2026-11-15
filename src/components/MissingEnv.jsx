import { CircleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

// Browsing remains available while account services are not configured.
function MissingEnv() {
  return (
    <div className="page page-narrow">
      <div className="empty">
        <CircleAlert aria-hidden="true" />
        <h1>Accounts are coming soon</h1>
        <p>Sign-in and posting are not available yet. You can still explore the map and try fictional subleases on Browse.</p>
        <Link className="btn btn-primary" to="/browse">Explore Browse</Link>
      </div>
    </div>
  )
}

export default MissingEnv

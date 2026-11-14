import { MapPinned } from 'lucide-react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="page page-narrow">
      <div className="empty">
        <MapPinned aria-hidden="true" />
        <h1>Page not found</h1>
        <p>That address isn't on our map. The link may be old or mistyped.</p>
        <Link to="/browse" className="btn btn-primary">
          Browse subleases
        </Link>
      </div>
    </div>
  )
}

export default NotFound

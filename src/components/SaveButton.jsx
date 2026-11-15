import { Heart } from 'lucide-react'
import { useSaved } from '../context/saved.js'
import { useAuth } from '../context/auth.js'
import { isLocalDemo } from '../lib/demoListings.js'

// The heart. Signed-out visitors who press it are sent to sign in (the saved
// context handles that), then brought back to the same spot.
function SaveButton({ listingId, className = '' }) {
  const { ids, toggle, pending, ready, failed } = useSaved()
  const { user } = useAuth()
  const saved = ids.has(listingId)

  return (
    <button
      type="button"
      className={`icon-btn save-btn ${className}`}
      aria-pressed={saved}
      aria-label={isLocalDemo(listingId) ? 'Test listings cannot be saved' : saved ? 'Remove from saved' : 'Save this listing'}
      disabled={isLocalDemo(listingId) || pending?.has(`${user?.id}/${listingId}`) || (!ready && !failed)}
      onClick={() => toggle(listingId)}
    >
      <Heart aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}

export default SaveButton

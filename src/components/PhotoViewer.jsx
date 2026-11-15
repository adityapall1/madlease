import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { useState } from 'react'
import { photoUrl } from '../lib/api.js'

// One large photo with thumbnails underneath. The left and right arrow keys
// move between photos whenever the viewer (or anything in it) has focus.
function PhotoViewer({ photos }) {
  const [at, setAt] = useState(0)
  const total = photos.length

  if (total === 0) {
    return (
      <div className="viewer-empty">
        <ImageOff aria-hidden="true" />
        No photos yet
      </div>
    )
  }

  // Wraps around: going past the last photo returns to the first.
  const step = (by) => setAt((at + by + total) % total)

  function onKey(event) {
    if (event.key === 'ArrowRight') step(1)
    else if (event.key === 'ArrowLeft') step(-1)
    else return
    event.preventDefault()
  }

  return (
    <div
      className="viewer"
      role="group"
      aria-label={total > 1 ? `Photos. Use the left and right arrow keys to move between ${total} photos.` : 'Photo'}
      tabIndex={total > 1 ? 0 : undefined}
      onKeyDown={total > 1 ? onKey : undefined}
    >
      <div className="viewer-main">
        <img src={photoUrl(photos[at])} alt={`Photo ${at + 1} of ${total}`} />
        {total > 1 && (
          <>
            <button type="button" className="viewer-arrow viewer-prev" onClick={() => step(-1)} aria-label="Previous photo">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className="viewer-arrow viewer-next" onClick={() => step(1)} aria-label="Next photo">
              <ChevronRight aria-hidden="true" />
            </button>
            <span className="viewer-count" aria-hidden="true">
              {at + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="viewer-thumbs">
          {photos.map((path, i) => (
            <button
              key={path}
              type="button"
              className="viewer-thumb"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === at ? 'true' : undefined}
              onClick={() => setAt(i)}
            >
              <img src={photoUrl(path)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PhotoViewer

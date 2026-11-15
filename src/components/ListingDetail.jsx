import { ArrowLeft, BedDouble, Calendar, CircleAlert, Footprints, MapPinned, Pencil, RefreshCw, Sofa } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import { useToast } from '../context/toast.js'
import * as api from '../lib/api.js'
import { amenityLabel } from '../lib/constants.js'
import { dataMessage } from '../lib/errors.js'
import { formatDates, formatLength, formatUnitLong, formatWalk, rentParts, today } from '../lib/format.js'
import { walkMinutes } from '../lib/geo.js'
import PhotoViewer from './PhotoViewer.jsx'
import PosterCard from './PosterCard.jsx'
import SaveButton from './SaveButton.jsx'

// The left panel when a listing is open.
//   listings  what browse already loaded; most listings are found here
//   waiting   true while browse is still loading that list
//   back      link target for "Back to results" (keeps the filters)
//   onChange  tells browse a listing was changed here (marked taken, reactivated)
function ListingDetail({ id, listings, waiting, back, landmark, onChange }) {
  const { user } = useAuth()
  const toast = useToast()
  const backLink = useRef(null)

  // A listing that browse doesn't have (your own taken or expired one, opened
  // from your profile) is fetched on its own and kept here.
  const [own, setOwn] = useState(null)
  // How the fetch went: null while waiting, then 'found', 'missing' or 'error'.
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)

  const row = own ?? listings.find((l) => l.id === id)
  const have = Boolean(row)
  const userId = user?.id

  useEffect(() => {
      if (have || waiting) return
    let stale = false
    api
      .fetchListing(id)
      .then((found) => {
        if (stale) return
        if (found) setOwn(found)
        setResult(found ? 'found' : 'missing')
      })
      .catch(() => {
        if (!stale) setResult('error')
      })
    return () => {
      stale = true
    }
    // userId is here because signing in can reveal a listing that was hidden.
  }, [id, have, waiting, attempt, userId])

  // Opening a listing replaces the list, so put keyboard focus at the top of
  // the new content instead of leaving it on a card that is gone.
  useEffect(() => {
    backLink.current?.focus()
  }, [])

  function retry() {
    setResult(null)
    setAttempt(attempt + 1)
  }

  const top = (
    <div className="detail-top">
      <Link to={back} className="btn btn-ghost btn-sm" ref={backLink}>
        <ArrowLeft aria-hidden="true" />
        Back to results
      </Link>
      {row && <SaveButton listingId={row.id} />}
    </div>
  )

  if (!row) {
    if (result === 'missing') {
      return (
        <div className="detail">
          {top}
          <div className="empty">
            <MapPinned aria-hidden="true" />
            <h1>Listing not available</h1>
            <p>This listing doesn't exist, or it has been taken or has ended.</p>
            <Link to={back} className="btn btn-primary">
              See what's available
            </Link>
          </div>
        </div>
      )
    }

    if (result === 'error') {
      return (
        <div className="detail">
          {top}
          <div className="empty">
            <CircleAlert aria-hidden="true" />
            <p>We couldn't load this listing. Check your connection and try again.</p>
            <button type="button" className="btn btn-outline" onClick={retry}>
              <RefreshCw aria-hidden="true" />
              Retry
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="detail" role="status" aria-label="Loading listing">
        {top}
        <div className="skeleton" style={{ aspectRatio: '4 / 3' }} />
        <div className="skeleton" style={{ width: '70%', height: 26 }} />
        <div className="skeleton" style={{ width: '45%', height: 18 }} />
        <div className="skeleton" style={{ height: 90 }} />
      </div>
    )
  }

  const { price, basis } = rentParts(row)
  const isOwner = Boolean(userId) && row.owner_id === userId
  const expired = row.end_date < today()
  const walk = row.building ? formatWalk(walkMinutes(row.building, landmark), landmark) : null

  async function setStatus(status) {
    setBusy(true)
    try {
      const updated = await api.updateListing(row.id, { status })
      setOwn(updated)
      onChange(updated)
      toast(status === 'taken' ? 'Marked as taken. It no longer shows up in browse.' : 'Reactivated. It is back in browse.')
    } catch (err) {
      toast(dataMessage(err, "Couldn't update the listing. Try again."))
    }
    setBusy(false)
  }

  return (
    <article className="detail">
      {top}

      <PhotoViewer photos={row.photos} />

      <header className="detail-head">
        <h1>{row.title}</h1>
        <p className="muted">
          {row.building?.name}
          {row.building?.address && row.building.address !== row.building.name && ` · ${row.building.address}`}
        </p>
        <p className="detail-rent">
          {price} <span>{basis}</span>
        </p>
      </header>

      {isOwner && (row.status === 'taken' || expired) && (
        <p className="note">
          <CircleAlert aria-hidden="true" />
          {row.status === 'taken'
            ? 'You marked this as taken. Only you can see it.'
            : 'This sublease has ended, so only you can see it. Edit the dates to list it again.'}
        </p>
      )}

      {isOwner && (
        <div className="detail-owner">
          <Link to={`/listings/${row.id}/edit`} className="btn btn-outline btn-sm">
            <Pencil aria-hidden="true" />
            Edit
          </Link>
          {row.status === 'active' ? (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatus('taken')} disabled={busy}>
              Mark as taken
            </button>
          ) : (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatus('active')} disabled={busy}>
              Reactivate
            </button>
          )}
        </div>
      )}

      <ul className="detail-facts">
        <li>
          <BedDouble aria-hidden="true" />
          {formatUnitLong(row)}
        </li>
        <li>
          <Calendar aria-hidden="true" />
          <span>
            {formatDates(row.start_date, row.end_date)}{' '}
            <span className="muted">({formatLength(row.start_date, row.end_date)})</span>
          </span>
        </li>
        <li>
          <Sofa aria-hidden="true" />
          {row.furnished ? 'Furnished' : 'Not furnished'}
        </li>
        {walk && (
          <li>
            <Footprints aria-hidden="true" />
            {walk}
          </li>
        )}
      </ul>

      {row.amenities.length > 0 && (
        <ul className="detail-tags" aria-label="Amenities">
          {row.amenities.map((a) => (
            <li key={a} className="tag">
              {amenityLabel(a)}
            </li>
          ))}
        </ul>
      )}

      {row.description && (
        <section>
          <h2>About this place</h2>
          <p className="detail-text">{row.description}</p>
        </section>
      )}

      {!isOwner && <PosterCard listing={row} />}
    </article>
  )
}

export default ListingDetail

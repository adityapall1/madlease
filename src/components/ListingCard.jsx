import { Building2, Footprints } from 'lucide-react'
import { Link } from 'react-router-dom'
import { photoUrl } from '../lib/api.js'
import { formatDates, formatUnit, rentParts } from '../lib/format.js'
import SaveButton from './SaveButton.jsx'

// One listing in a list.
//   to       where the card links
//   walk     "about 9 min walk to Bascom", or nothing to leave the line out
//   hot      true while this card's building is hovered on the map
//   onHover  tells the map which building to highlight (optional)
//   badge    a status pill or similar, shown beside the rent (optional)
//   actions  extra buttons under the card, used on the profile page (optional)
function ListingCard({ listing, to, walk, hot = false, onHover, badge, actions }) {
  const { price, basis } = rentParts(listing)
  const cover = listing.photos[0]
  const place = listing.building?.name ?? 'Unknown building'

  // Keyboard focus counts as hovering, so tabbing through the list lights up
  // buildings on the map the same way the mouse does.
  const point = onHover && {
    onMouseEnter: () => onHover(listing.building_id),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(listing.building_id),
    onBlur: () => onHover(null),
  }

  return (
    <li className={`listing-card${hot ? ' is-hot' : ''}`} {...point}>
      <Link to={to} className="listing-link" aria-label={`${listing.title}, ${price} ${basis}`}>
        <div className="listing-photo">
          {cover ? <img src={photoUrl(cover)} alt="" loading="lazy" /> : <Building2 aria-hidden="true" />}
        </div>
        <div className="listing-info">
          <p className="listing-rent">
            {price} <span>{basis}</span>
            {badge}
            {listing.is_demo && <span className="badge">Demo</span>}
          </p>
          <p>{formatUnit(listing)}</p>
          <p className="listing-place">{place}</p>
          <p className="muted">{formatDates(listing.start_date, listing.end_date)}</p>
          {walk && (
            <p className="muted listing-walk">
              <Footprints aria-hidden="true" />
              {walk}
            </p>
          )}
        </div>
      </Link>
      {/* The heart sits beside the link, not inside it: a button inside a link
          can't be reached properly with a keyboard. */}
      <SaveButton listingId={listing.id} className="listing-save" />
      {actions && <div className="listing-actions">{actions}</div>}
    </li>
  )
}

export default ListingCard

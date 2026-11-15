// Grey placeholder cards shown while listings load. They take up the same
// space as real cards, so the page doesn't jump when the data arrives.
function CardSkeleton({ count = 5 }) {
  return (
    <ul className="cards" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="listing-card">
          <div className="listing-link">
            <div className="listing-photo skeleton" />
            <div className="listing-info">
              <div className="skeleton" style={{ width: '55%', height: 18 }} />
              <div className="skeleton" style={{ width: '70%', height: 14 }} />
              <div className="skeleton" style={{ width: '40%', height: 14 }} />
              <div className="skeleton" style={{ width: '60%', height: 14 }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default CardSkeleton

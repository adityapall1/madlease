import { useState } from 'react'
import ApartmentMap from '../components/ApartmentMap.jsx'
import { apartments, formatRange, formatUnit, leaseSummary } from '../data/apartments.js'

// What the panel shows before anything is picked: every building with its
// headline numbers. Clicking a row selects it, so the map is not the only way in.
function ApartmentList({ onSelect }) {
  return (
    <>
      <h2>Listings</h2>
      <p className="hint">Select an apartment to see its subleases.</p>
      <ul className="apartment-list">
        {apartments.map((apartment) => {
          const summary = leaseSummary(apartment)
          return (
            <li key={apartment.id}>
              <button
                type="button"
                className="apartment-row"
                onClick={() => onSelect(apartment.id)}
              >
                <span className="apartment-row-name">{apartment.name}</span>
                <span className="apartment-row-meta">
                  {summary.count} options &middot; {formatRange(summary)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function ApartmentDetail({ apartment, onBack, isSaved, onToggleSave }) {
  const summary = leaseSummary(apartment)
  // Cheapest first, so the range above reads straight down the list. Copied
  // before sorting -- sort() would otherwise reorder the imported data itself.
  const leases = [...apartment.leases].sort((a, b) => a.rent - b.rent)

  return (
    <>
      <button type="button" className="back" onClick={onBack}>
        &larr; All apartments
      </button>
      <h2>{apartment.name}</h2>
      <p className="address">{apartment.address}</p>
      <p className="summary">
        <strong>
          {summary.count} lease {summary.count === 1 ? 'option' : 'options'} available
        </strong>
        <br />
        {formatRange(summary)} /mo
      </p>
      <ul className="lease-list">
        {leases.map((lease) => (
          <li key={lease.id} className="lease-card">
            <span className="lease-unit">{formatUnit(lease)}</span>
            <span className="lease-rent">${lease.rent.toLocaleString()}/mo</span>
            <span className="lease-term">
              {lease.start} &ndash; {lease.end}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onToggleSave}> {isSaved ? 'Remove from Saved' : 'Save Apartment'} </button>
    </>
  )
}

function Browse({ savedApartmentIds, setSavedApartmentIds }) {
  // The one piece of state on this page. Both the panel and the map read it, so
  // they cannot disagree about which building is highlighted.
  const [selectedId, setSelectedId] = useState(null)
  const selected = apartments.find((apartment) => apartment.id === selectedId) ?? null

  function toggleSavedApartment(id) {
    setSavedApartmentIds((prev) =>
      prev.includes(id)
        ? prev.filter((savedId) => savedId !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="browse">
      <section className="listings">
        {selected ? (
          <ApartmentDetail apartment={selected} onBack={() => setSelectedId(null)} isSaved={savedApartmentIds.includes(selected.id)} onToggleSave={() => toggleSavedApartment(selected.id)} />
        ) : (
          <ApartmentList onSelect={setSelectedId} />
        )}
      </section>
      <ApartmentMap apartments={apartments} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  )
}

export default Browse

import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useIsMobile } from '../lib/useIsMobile.js'
import { landmarks } from '../data/landmarks.js'
import { AMENITIES } from '../lib/constants.js'
import { BATH_CHOICES, BED_CHIPS } from '../lib/filters.js'
import { plural } from '../lib/format.js'
import DebouncedInput from './DebouncedInput.jsx'

const digits = (text) => text.replace(/\D/g, '')

// Adds an item to a list if it is missing, removes it if it is there.
const flip = (list, item) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

// Every filter control. On a wide screen this opens under the search box; on a
// phone the same markup is styled as a full-screen sheet (see browse.css).
//
//   onChange(patch, { replace })  merges the patch into the URL filters
function FilterPanel({ filters, onChange, landmark, onLandmark, count, active, onClear, onClose }) {
  const mobile = useIsMobile()
  const dialog = useRef(null)
  useEffect(() => {
    if (!mobile) return
    const el = dialog.current
    el.showModal()
    return () => el.close()
  }, [mobile])
  const Wrapper = mobile ? 'dialog' : 'div'
  return (
    <Wrapper ref={dialog} className="filter-panel" id="filter-panel" role={mobile ? undefined : 'region'} aria-label="Filters" onCancel={(e) => { e.preventDefault(); e.stopPropagation(); onClose() }}>
      <div className="filter-panel-head">
        <h2>Filters</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close filters">
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="filter-body">
        {mobile && <label className="field">Search by building or street<DebouncedInput className="input" type="search" value={filters.q} onCommit={(q) => onChange({ q }, { replace: true })} /></label>}
        <fieldset className="filter-group">
          <legend>Rent per month</legend>
          <div className="filter-pair">
            <DebouncedInput
              className="input"
              inputMode="numeric"
              placeholder="Min $"
              aria-label="Minimum rent"
              value={filters.min}
              clean={digits}
              // Typing replaces the current history entry. Otherwise the back
              // button would step through every pause in someone's typing.
              onCommit={(min) => onChange({ min }, { replace: true })}
            />
            <span aria-hidden="true">to</span>
            <DebouncedInput
              className="input"
              inputMode="numeric"
              placeholder="Max $"
              aria-label="Maximum rent"
              value={filters.max}
              clean={digits}
              onCommit={(max) => onChange({ max }, { replace: true })}
            />
          </div>
        </fieldset>

        <fieldset className="filter-group">
          <legend>Bedrooms</legend>
          <div className="chips">
            {BED_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className="chip"
                aria-pressed={filters.beds.includes(chip.id)}
                onClick={() => onChange({ beds: flip(filters.beds, chip.id) })}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="filter-pair">
          <div className="field">
            <label className="label" htmlFor="f-baths">
              Bathrooms
            </label>
            <select
              id="f-baths"
              className="select"
              value={filters.baths}
              onChange={(e) => onChange({ baths: e.target.value })}
            >
              <option value="">Any</option>
              {BATH_CHOICES.map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="f-type">
              What's on offer
            </label>
            <select
              id="f-type"
              className="select"
              value={filters.type}
              onChange={(e) => onChange({ type: e.target.value })}
            >
              <option value="">Either</option>
              <option value="entire">Whole unit</option>
              <option value="room">Room in a shared unit</option>
            </select>
          </div>
        </div>

        <fieldset className="filter-group">
          <legend>Move-in and move-out</legend>
          <div className="filter-pair">
            <input
              type="date"
              className="input"
              aria-label="Move-in date"
              value={filters.moveIn}
              onInput={(e) => onChange({ moveIn: e.target.value }, { replace: true })}
            />
            <span aria-hidden="true">to</span>
            <input
              type="date"
              className="input"
              aria-label="Move-out date"
              value={filters.moveOut}
              min={filters.moveIn || undefined}
              onInput={(e) => onChange({ moveOut: e.target.value }, { replace: true })}
            />
          </div>
          <p className="hint">Both are optional. Shows subleases that cover the dates you pick.</p>
        </fieldset>

        <fieldset className="filter-group">
          <legend>Amenities</legend>
          <div className="chips">
            <button
              type="button"
              className="chip"
              aria-pressed={filters.furnished}
              onClick={() => onChange({ furnished: !filters.furnished })}
            >
              Furnished
            </button>
            {AMENITIES.map((a) => (
              <button
                key={a.id}
                type="button"
                className="chip"
                aria-pressed={filters.amenities.includes(a.id)}
                onClick={() => onChange({ amenities: flip(filters.amenities, a.id) })}
              >
                {a.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label className="label" htmlFor="f-landmark">
            Show walk times to
          </label>
          <select id="f-landmark" className="select" value={landmark.id} onChange={(e) => onLandmark(e.target.value)}>
            {landmarks.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-foot">
        <button type="button" className="link" onClick={onClear} disabled={active === 0}>
          Clear filters
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
          Show {plural(count, 'sublease')}
        </button>
      </div>
    </Wrapper>
  )
}

export default FilterPanel


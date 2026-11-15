import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react'
import { plural } from '../lib/format.js'
import DebouncedInput from './DebouncedInput.jsx'
import FilterPanel from './FilterPanel.jsx'

// The strip that stays at the top of the list: search, the Filters button,
// and (when open) the filter controls. On a phone its first row is also the
// handle of the bottom sheet.
//
//   active     how many filters are on
//   count      how many listings match
//   note       text for the "you're hovering this building" note, or null
//   sheetOpen  phone only: whether the bottom sheet is pulled up
function FilterBar({
  filters,
  onChange,
  onClear,
  active,
  count,
  landmark,
  onLandmark,
  open,
  onOpen,
  note,
  sheetOpen,
  onSheet,
}) {
  const filtersButton = (extra) => (
    <button
      type="button"
      className={`btn btn-outline btn-sm ${extra}`}
      aria-expanded={open}
      aria-controls="filter-panel"
      onClick={() => onOpen(!open)}
    >
      <SlidersHorizontal aria-hidden="true" />
      Filters
      {active > 0 && (
        <span className="badge" aria-label={`${active} on`}>
          {active}
        </span>
      )}
    </button>
  )

  return (
    <div className="filter-bar">
      {/* Phone only. Tapping the count pulls the sheet up or drops it down. */}
      <div className="sheet-top">
        <button type="button" className="sheet-handle" aria-expanded={sheetOpen} onClick={onSheet}>
          <span className="sheet-grip" aria-hidden="true" />
          {plural(count, 'sublease')}
          {sheetOpen ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
          <span className="sr-only">{sheetOpen ? 'Hide the list' : 'Show the list'}</span>
        </button>
        {filtersButton('')}
      </div>

      <div className="filter-row">
        <div className="search">
          <Search aria-hidden="true" />
          <DebouncedInput
            className="input"
            type="search"
            placeholder="Search by building or street"
            aria-label="Search by building name or address"
            value={filters.q}
            onCommit={(q) => onChange({ q }, { replace: true })}
          />
        </div>
        {filtersButton('filter-toggle')}
      </div>

      {open && (
        <FilterPanel
          filters={filters}
          onChange={onChange}
          landmark={landmark}
          onLandmark={onLandmark}
          count={count}
          active={active}
          onClear={onClear}
          onClose={() => onOpen(false)}
        />
      )}

      {/* Shown while a building is hovered on the map. It floats over the top
          of the list instead of scrolling the list to the matching cards,
          which would make the page jump around under the mouse. */}
      {note && (
        <div className="hover-note" role="status">
          {note}
        </div>
      )}
    </div>
  )
}

export default FilterBar

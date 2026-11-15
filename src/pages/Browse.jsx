import { CircleAlert, RefreshCw, SearchX, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useMatch, useNavigate, useSearchParams } from 'react-router-dom'
import BrowseMap from '../components/BrowseMap.jsx'
import CardSkeleton from '../components/CardSkeleton.jsx'
import FilterBar from '../components/FilterBar.jsx'
import ListingCard from '../components/ListingCard.jsx'
import ListingDetail from '../components/ListingDetail.jsx'
import { useAuth } from '../context/auth.js'
import * as api from '../lib/api.js'
import { SORTS, clearFilters, countFilters, matches, readFilters, sortListings, writeFilters } from '../lib/filters.js'
import { formatWalk, leaseSummary, plural, today } from '../lib/format.js'
import { walkMinutes } from '../lib/geo.js'
import { useIsMobile } from '../lib/useIsMobile.js'
import { useLandmark } from '../lib/useLandmark.js'

// Listings on the left, map on the right.
//
// This page owns the two things both sides care about: which building is
// hovered and which is selected. The list and the map are each handed the same
// values, so they can't disagree about what is highlighted.
//
// Filtering and sorting run here in the browser. There are at most a few
// hundred listings, so we load the active ones once and work in memory, which
// makes every filter change instant. docs/ARCHITECTURE.md says where that
// stops being a good idea.
function Browse() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // /browse/listings/:id shows the same page with the detail in the left panel.
  const detailId = useMatch('/browse/listings/:id')?.params.id ?? null

  // The URL is where the filters live. Everything below is worked out from it.
  const filters = useMemo(() => readFilters(params), [params])
  const currentFilters = useRef(filters)
  useEffect(() => { currentFilters.current = filters }, [filters])
  const [landmark, chooseLandmark] = useLandmark()

  const [status, setStatus] = useState('loading') // 'loading', 'ready' or 'error'
  const [listings, setListings] = useState([])
  const [buildings, setBuildings] = useState([])
  const [attempt, setAttempt] = useState(0)

  const [hovered, setHovered] = useState(null) // { id, from: 'map' or 'list' }
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    let stale = false
    Promise.all([api.fetchActiveListings(), api.fetchBuildings()])
      .then(([rows, places]) => {
        if (stale) return
        setListings(rows)
        setBuildings(places)
        setStatus('ready')
      })
      .catch(() => {
        if (!stale) setStatus('error')
      })
    return () => {
      stale = true
    }
  }, [attempt])

  function retry() {
    setStatus('loading')
    setAttempt(attempt + 1)
  }

  // --- What matches -------------------------------------------------------

  // Listings that pass the filters, at any building.
  const matching = useMemo(() => listings.filter((row) => matches(row, filters)), [listings, filters])

  // Per building: how many listings match, and their price range. Only
  // buildings with at least one active listing get an entry, which is also
  // what decides whether a building is drawn on the map at all.
  const stats = useMemo(() => {
    const groups = new Map()
    for (const row of listings) groups.set(row.building_id, [])
    for (const row of matching) groups.get(row.building_id).push(row)

    const out = new Map()
    for (const [id, rows] of groups) out.set(id, { count: rows.length, summary: leaseSummary(rows) })
    return out
  }, [listings, matching])

  const places = useMemo(() => buildings.filter((b) => stats.has(b.id)), [buildings, stats])

  // The selected building, if the id in the URL is a real one on the map.
  const picked = places.find((b) => b.id === filters.building) ?? null
  const selected = picked?.id ?? null

  const shown = useMemo(() => {
    const rows = selected ? matching.filter((row) => row.building_id === selected) : matching
    return sortListings(rows, filters.sort, landmark)
  }, [matching, selected, filters.sort, landmark])

  const walks = useMemo(() => {
    const out = new Map()
    for (const b of buildings) out.set(b.id, formatWalk(walkMinutes(b, landmark), landmark))
    return out
  }, [buildings, landmark])

  // --- Changing things ----------------------------------------------------

  const update = useCallback(
    (patch, options = {}) => {
      const next = { ...currentFilters.current, ...patch }
      currentFilters.current = next
      setParams(writeFilters(next), { replace: options.replace ?? false })
    },
    [setParams],
  )

  // Clicking a building selects it; clicking it again clears it. Either way we
  // land on the list, even if a listing was open.
  const select = useCallback(
    (id) => {
      const next = writeFilters({ ...filters, building: filters.building === id ? '' : id }).toString()
      navigate({ pathname: '/browse', search: next ? `?${next}` : '' })
    },
    [filters, navigate],
  )

  // Moving the mouse from a building onto its price pill counts as leaving one
  // thing and entering another. Waiting a moment before clearing stops the
  // highlight from blinking off and on in between.
  const leaving = useRef(null)
  const hover = useCallback((id, from) => {
    clearTimeout(leaving.current)
    if (id) setHovered({ id, from })
    else leaving.current = setTimeout(() => setHovered(null), 60)
  }, [])
  const hoverMap = useCallback((id) => hover(id, 'map'), [hover])
  const hoverList = useCallback((id) => hover(id, 'list'), [hover])
  useEffect(() => () => clearTimeout(leaving.current), [])

  // Escape closes the filters if they're open, otherwise clears the selection.
  // defaultPrevented means something else (the account menu) already used it.
  useEffect(() => {
    function onKey(event) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      if (filtersOpen) setFiltersOpen(false)
      else if (selected && !detailId) select(selected)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtersOpen, selected, detailId, select])

  // A listing was marked taken or reactivated in the detail panel. Keep the
  // list in step without refetching everything.
  function onListingChange(row) {
    setListings((rows) => {
      const rest = rows.filter((l) => l.id !== row.id)
      const live = row.status === 'active' && row.end_date >= today()
      return live ? [row, ...rest] : rest
    })
  }

  // --- Pieces of the page -------------------------------------------------

  const open = detailId ? listings.find((row) => row.id === detailId) : null
  const active = countFilters(filters)

  let note = null
  if (hovered?.from === 'map' && !detailId && stats.has(hovered.id)) {
    const name = buildings.find((b) => b.id === hovered.id)?.name
    const hint = hovered.id === selected ? 'click to show all' : 'click to filter'
    note = `${name} · ${plural(stats.get(hovered.id).count, 'listing')} · ${hint}`
  }

  let body
  if (status === 'loading') {
    body = <CardSkeleton />
  } else if (status === 'error') {
    body = (
      <div className="empty">
        <CircleAlert aria-hidden="true" />
        <p>We couldn't load the subleases. Check your connection and try again.</p>
        <button type="button" className="btn btn-outline" onClick={retry}>
          <RefreshCw aria-hidden="true" />
          Retry
        </button>
      </div>
    )
  } else if (listings.length === 0) {
    body = (
      <div className="empty">
        <SearchX aria-hidden="true" />
        <p>Nobody has posted a sublease yet.</p>
        <Link to="/listings/new" className="btn btn-primary">
          Post the first one
        </Link>
      </div>
    )
  } else if (shown.length === 0) {
    body = (
      <div className="empty">
        <SearchX aria-hidden="true" />
        <p>{picked ? `No subleases at ${picked.name} match these filters` : 'No subleases match these filters'}</p>
        {active > 0 ? (
          <button type="button" className="btn btn-outline" onClick={() => update(clearFilters(filters))}>
            Clear filters
          </button>
        ) : (
          <button type="button" className="btn btn-outline" onClick={() => select(selected)}>
            Show all buildings
          </button>
        )}
      </div>
    )
  } else {
    body = (
      <ul className="cards">
        {shown.map((row) => (
          <ListingCard
            key={row.id}
            listing={row}
            to={{ pathname: `/browse/listings/${row.id}`, search: location.search }}
            walk={walks.get(row.building_id)}
            hot={hovered?.id === row.building_id}
            onHover={hoverList}
          />
        ))}
      </ul>
    )
  }

  const classes = ['browse', detailId && 'has-detail', sheetOpen && 'sheet-open'].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <section className="panel" aria-label={detailId ? 'Listing details' : 'Subleases'}>
        {/* The list stays mounted (just hidden) while a listing is open, so
            "Back to results" returns to the same scroll position. */}
        <div className="panel-layer" data-hidden={detailId ? '' : undefined}>
          <FilterBar
            filters={filters}
            onChange={update}
            onClear={() => update(clearFilters(filters))}
            active={active}
            count={shown.length}
            landmark={landmark}
            onLandmark={chooseLandmark}
            open={filtersOpen}
            onOpen={setFiltersOpen}
            note={note}
            sheetOpen={sheetOpen}
            onSheet={() => setSheetOpen(!sheetOpen)}
          />

          {/* On a phone the list is tucked under the map until the sheet is
              pulled up. `inert` keeps the keyboard out of the hidden part. */}
          <div inert={isMobile && !sheetOpen}>
            {picked && (
              <p className="picked">
                Showing {plural(shown.length, 'listing')} at {picked.name}
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => select(picked.id)}
                  aria-label={`Stop filtering to ${picked.name}`}
                >
                  <X aria-hidden="true" />
                </button>
              </p>
            )}

            <div className="results-head">
              <p role="status">{status === 'ready' ? plural(shown.length, 'sublease') : ' '}</p>
              <label className="sort">
                Sort
                <select className="select" value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id === 'near' ? `Closest to ${landmark.short}` : s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {body}
          </div>
        </div>

        {detailId && (
          <div className="panel-layer detail-layer">
            <ListingDetail
              // A new key per listing resets the panel's state between listings.
              key={`${detailId}:${user?.id ?? 'guest'}`}
              id={detailId}
              listings={listings}
              waiting={status === 'loading'}
              back={{ pathname: '/browse', search: location.search }}
              landmark={landmark}
              onChange={onListingChange}
            />
          </div>
        )}
      </section>

      <BrowseMap
        buildings={places}
        stats={stats}
        hovered={hovered?.id ?? null}
        selected={selected}
        focus={open?.building_id ?? null}
        landmark={landmark}
        onHover={hoverMap}
          onLandmark={chooseLandmark}
        onSelect={select}
      />
    </div>
  )
}

export default Browse

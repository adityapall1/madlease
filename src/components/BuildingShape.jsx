import { useEffect, useMemo, useRef } from 'react'
import { CircleMarker, Polygon, Tooltip } from 'react-leaflet'
import { footprintToLatLngs } from '../lib/geo.js'

// Leaflet only reads className when it first draws a shape, so this never
// changes. The colours come from CSS (map.css), not from options here.
const PATH = { className: 'bldg' }

// One building on the map: its real outline when we have one, a dot when we
// don't. `state` is idle, dimmed, hovered or selected.
function BuildingShape({ building, state, tip, onHover, onSelect }) {
  const layer = useRef(null)
  // Whether the mouse is over this shape right now. Leaflet opens and closes
  // the tooltip itself in that case, so we must not fight it.
  const inside = useRef(false)

  // The look of each state lives in CSS, keyed off data-state. That way the
  // colours follow the theme tokens and can fade from one state to the next,
  // which setting colours from JavaScript can't do.
  useEffect(() => {
    const shape = layer.current
    const el = shape?.getElement()
    if (!el) return

    el.setAttribute('data-state', state)
    if (state === 'hovered' || state === 'selected') shape.bringToFront()

    // Hovering a card in the list highlights this building, but the mouse
    // isn't here to make the tooltip appear. Show it by hand so the name pops
    // up on the map too.
    if (inside.current) return
    if (state === 'hovered') shape.openTooltip()
    else shape.closeTooltip()
  }, [state])

  const handlers = useMemo(
    () => ({
      click: () => onSelect(building.id),
      mouseover: () => {
        inside.current = true
        onHover(building.id)
      },
      mouseout: () => {
        inside.current = false
        onHover(null)
      },
    }),
    [building.id, onHover, onSelect],
  )

  const outline = useMemo(
    () => (building.footprint ? footprintToLatLngs(building.footprint) : null),
    [building.footprint],
  )

  // "sticky" makes the tooltip follow the mouse around inside the shape.
  const tooltip = (
    <Tooltip sticky direction="top" offset={[0, -10]} className="map-tip">
      <strong>{building.name}</strong>
      <span>{tip}</span>
    </Tooltip>
  )

  if (outline) {
    return (
      <Polygon ref={layer} positions={outline} pathOptions={PATH} eventHandlers={handlers}>
        {tooltip}
      </Polygon>
    )
  }

  const big = state === 'hovered' || state === 'selected'
  return (
    <CircleMarker
      ref={layer}
      center={[building.lat, building.lng]}
      radius={big ? 11 : 8}
      pathOptions={PATH}
      eventHandlers={handlers}
    >
      {tooltip}
    </CircleMarker>
  )
}

export default BuildingShape

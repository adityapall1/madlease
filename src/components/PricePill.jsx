import L from 'leaflet'
import { useMemo } from 'react'
import { Marker, Tooltip } from 'react-leaflet'

const ORDER = { selected: 1000, hovered: 900, idle: 0 }

// The small "from $1,150" label that sits on a building when zoomed in. It
// behaves like part of the building: hovering or clicking it does the same
// thing as hovering or clicking the outline underneath.
function PricePill({ building, text, state, onHover, onSelect }) {
  // Leaflet draws the pill from an HTML string. `text` only ever contains a
  // formatted price, never anything a user typed, so this is safe.
  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'pill-anchor',
        html: `<span class="price-pill" data-state="${state}">${text}</span>`,
        iconSize: [0, 0],
      }),
    [text, state],
  )

  const handlers = useMemo(
    () => ({
      click: () => onSelect(building.id),
      mouseover: () => onHover(building.id),
      mouseout: () => onHover(null),
    }),
    [building.id, onHover, onSelect],
  )

  return (
    <Marker
      position={[building.lat, building.lng]}
      icon={icon}
      // Not a tab stop: the list is the keyboard way to reach every listing.
      keyboard={false}
      zIndexOffset={ORDER[state] ?? 0}
      eventHandlers={handlers}
    >
      <Tooltip direction="top" offset={[0, -16]} className="map-tip">
        <strong>{building.name}</strong>
      </Tooltip>
    </Marker>
  )
}

export default PricePill

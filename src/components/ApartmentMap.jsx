import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
// Without Leaflet's own stylesheet the tiles render as scrambled, misplaced
// squares. It has to be imported somewhere, and here keeps it next to the map.
import 'leaflet/dist/leaflet.css'
import { formatRange, leaseSummary } from '../data/apartments.js'

// Only used if the data set is ever empty -- fitting bounds needs at least one
// point. Roughly the middle of campus.
const FALLBACK_CENTER = [43.0734, -89.3941]
const FALLBACK_ZOOM = 15

// UW cardinal, the one colour in the app. Highlighted markers use it at full
// strength so the selected building is obvious at a glance.
const MARKER_COLOR = '#c5050c'

// Circles instead of Leaflet's default pin markers: the default icon ships as an
// image that bundlers cannot resolve without extra setup, and a circle makes
// "highlighted" easy to show by growing it and filling it in.
function markerStyle(isActive) {
  return {
    color: MARKER_COLOR,
    weight: 2,
    fillColor: MARKER_COLOR,
    fillOpacity: isActive ? 0.85 : 0.35,
  }
}

// Brings the selected building into view. Needed because a selection can come
// from the listings panel, where there is nothing to tell the map to move.
function PanToSelected({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.panTo(coords)
  }, [coords, map])
  return null
}

function ApartmentMap({ apartments, selectedId, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null)
  const selected = apartments.find((apartment) => apartment.id === selectedId)

  // Zoom to fit whatever is in the data rather than hard-coding a zoom level, so
  // adding a building further out cannot leave it off screen. MapContainer reads
  // these once when the map is created, so this does not refit on every render.
  const view =
    apartments.length > 0
      ? {
          bounds: apartments.map((apartment) => apartment.coords),
          boundsOptions: { padding: [30, 30] },
        }
      : { center: FALLBACK_CENTER, zoom: FALLBACK_ZOOM }

  return (
    <MapContainer className="map" scrollWheelZoom {...view}>
      {/* OpenStreetMap asks that the attribution stay visible when its tiles are
          used, so the attribution prop is required rather than decorative. */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <PanToSelected coords={selected ? selected.coords : null} />
      {apartments.map((apartment) => {
        const summary = leaseSummary(apartment)
        const isActive = apartment.id === selectedId || apartment.id === hoveredId
        return (
          <CircleMarker
            key={apartment.id}
            center={apartment.coords}
            radius={isActive ? 11 : 7}
            pathOptions={markerStyle(isActive)}
            eventHandlers={{
              click: () => onSelect(apartment.id),
              mouseover: () => setHoveredId(apartment.id),
              mouseout: () => setHoveredId(null),
            }}
          >
            <Popup>
              <strong>{apartment.name}</strong>
              <br />
              {summary.count} lease {summary.count === 1 ? 'option' : 'options'} available
              <br />
              {formatRange(summary)} /mo
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}

export default ApartmentMap

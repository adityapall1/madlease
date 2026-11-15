import L from 'leaflet'
import { Maximize } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { boundsOfAll, buildingBounds } from '../lib/geo.js'
import { landmarks } from '../data/landmarks.js'

// Moves the view to a box. Glides there normally; jumps straight there for
// people who have asked their system for less motion.
function moveTo(map, bounds, options) {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (still) map.fitBounds(bounds, { ...options, animate: false })
  else map.flyToBounds(bounds, { ...options, duration: 0.7 })
}

// Decides where the map is looking: fits every building on first load, flies
// to a building when it is selected, and offers a "Reset view" button.
// It draws nothing on the map itself except that button.
function MapCamera({ buildings, selected, focus, landmark, onLandmark }) {
  const map = useMap()
  const button = useRef(null)
  // What the camera last reacted to, so it only moves when something changes.
  const last = useRef({ ready: false, selected: null, focus: null })

  useEffect(() => {
    if (buildings.length === 0) return
    const seen = last.current
    const find = (id) => buildings.find((b) => b.id === id)

    if (!seen.ready) {
      // First load. A link that already names a building opens zoomed in on
      // it; otherwise show everything. No animation: nothing was on screen yet.
      const target = find(selected ?? focus)
      if (target) map.fitBounds(buildingBounds(target), { maxZoom: 18, animate: false })
      else map.fitBounds(boundsOfAll(buildings), { padding: [40, 40], animate: false })
      seen.ready = true
    } else if (selected && selected !== seen.selected) {
      const target = find(selected)
      if (target) moveTo(map, buildingBounds(target), { maxZoom: 18, padding: [60, 60] })
    } else if (focus && focus !== seen.focus) {
      // A listing was opened. Only move if its building is off screen, so
      // opening listings one after another doesn't keep yanking the map around.
      const target = find(focus)
      if (target && !map.getBounds().contains([target.lat, target.lng])) {
        moveTo(map, buildingBounds(target), { maxZoom: Math.max(map.getZoom(), 16) })
      }
    }

    seen.selected = selected
    seen.focus = focus
  }, [map, buildings, selected, focus])

  // Stops clicks on the button from also reaching the map underneath.
  useEffect(() => {
    if (button.current) {
      L.DomEvent.disableClickPropagation(button.current)
      L.DomEvent.disableScrollPropagation(button.current)
    }
  }, [])

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control map-tools" ref={button}>
        <label className="map-destination">
          <span>Walk to</span>
          <select aria-label="Walking destination" value={landmark.id} onChange={event => onLandmark(event.target.value)}>
            {landmarks.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
          </select>
        </label>
        <button
          type="button"
          className="map-reset"
          onClick={() => buildings.length > 0 && moveTo(map, boundsOfAll(buildings), { padding: [40, 40] })}
        >
          <Maximize aria-hidden="true" />
          Reset view
        </button>
      </div>
    </div>
  )
}

export default MapCamera

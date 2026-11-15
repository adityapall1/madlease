import L from 'leaflet'
// Without Leaflet's own stylesheet the tiles render as scrambled, misplaced
// squares. It has to be imported somewhere, and here keeps it next to the map.
import 'leaflet/dist/leaflet.css'
import { useMemo, useState } from 'react'
import { MapContainer, Marker, useMapEvents } from 'react-leaflet'
import { landmarks } from '../data/landmarks.js'
import { madisonBox } from '../data/madison.js'
import { formatFrom } from '../lib/format.js'
import BuildingShape from './BuildingShape.jsx'
import MapCamera from './MapCamera.jsx'
import CampusMap from './CampusMap.jsx'
import PricePill from './PricePill.jsx'

// Where the map sits for the moment before the buildings load: the first
// landmark, or the middle of Madison if the landmark file is ever empty.
const START = landmarks[0] ?? {
  lat: (madisonBox.minLat + madisonBox.maxLat) / 2,
  lng: (madisonBox.minLng + madisonBox.maxLng) / 2,
}
const START_ZOOM = 15

// Price pills only appear this close in. Further out they would pile on top
// of each other and hide the map.
const PILL_ZOOM = 18

function ZoomWatcher({ onZoom }) {
  const map = useMapEvents({ zoomend: () => onZoom(map.getZoom()) })
  return null
}

// A small flag showing which landmark the walk times are measured to.
function LandmarkFlag({ landmark }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'pill-anchor',
        html: `<span class="landmark-flag"><i></i>${landmark.short}</span>`,
        iconSize: [0, 0],
      }),
    [landmark.short],
  )
  return <Marker position={[landmark.lat, landmark.lng]} icon={icon} interactive={false} keyboard={false} />
}

// The browse map. It keeps no selection of its own: `hovered`, `selected` and
// `focus` all come from the Browse page, which also hands them to the list,
// so the two sides can never disagree about what is highlighted.
//
//   stats     Map of building id -> { count, summary } for the current filters
//   selected  building the list is filtered to
//   focus     building of the listing that is open in the detail panel
function BrowseMap({ buildings, stats, hovered, selected, focus, landmark, onLandmark, onHover, onSelect }) {
  const [zoom, setZoom] = useState(START_ZOOM)

  function stateOf(building) {
    if (building.id === selected || building.id === focus) return 'selected'
    if (building.id === hovered) return 'hovered'
    if (stats.get(building.id).count === 0) return 'dimmed'
    return 'idle'
  }

  return (
    <div className="map-wrap">
      <MapContainer className="map" center={[START.lat, START.lng]} zoom={START_ZOOM} scrollWheelZoom>
        <CampusMap />
        <ZoomWatcher onZoom={setZoom} />
        <MapCamera buildings={buildings} selected={selected} focus={focus} landmark={landmark} onLandmark={onLandmark} />
        {landmark && <LandmarkFlag landmark={landmark} />}

        {buildings.map((building) => {
          const { count, summary } = stats.get(building.id)
          const state = stateOf(building)
          return (
            <BuildingShape
              key={building.id}
              building={building}
              state={state}
              tip={count > 0 ? formatFrom(summary) : 'Nothing here matches your filters'}
              onHover={onHover}
              onSelect={onSelect}
            />
          )
        })}

        {zoom >= PILL_ZOOM &&
          buildings
            .filter((building) => stats.get(building.id).count > 0)
            .map((building) => (
              <PricePill
                key={building.id}
                building={building}
                text={formatFrom(stats.get(building.id).summary)}
                state={stateOf(building)}
                onHover={onHover}
                onSelect={onSelect}
              />
            ))}
      </MapContainer>
    </div>
  )
}

export default BrowseMap

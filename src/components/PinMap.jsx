import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { landmarks } from '../data/landmarks.js'
import { madisonBox } from '../data/madison.js'
import { clampToBox } from '../lib/geo.js'
import { hasCarto } from '../lib/carto.js'
import MapTiles from './MapTiles.jsx'

const icon = L.divIcon({ className: 'location-pin', html: '<span aria-hidden="true">●</span>', iconSize: [28, 28], iconAnchor: [14, 14] })
const bounds = [[madisonBox.minLat, madisonBox.minLng], [madisonBox.maxLat, madisonBox.maxLng]]

function Pin({ value, onChange }) {
  const map = useMap()
  useMapEvents({ click: (e) => onChange(clampToBox(e.latlng, madisonBox)) })
  return <>
    {value && <Marker position={value} icon={icon} draggable title="Drag your location pin" eventHandlers={{ dragend: (e) => onChange(clampToBox(e.target.getLatLng(), madisonBox)) }} />}
    <div className="leaflet-bottom leaflet-left"><div className="leaflet-control">
      <button type="button" className="map-reset" onClick={(e) => { e.stopPropagation(); onChange(clampToBox(map.getCenter(), madisonBox)) }}>Use map center</button>
    </div></div>
  </>
}

export default function PinMap({ value, onChange }) {
  return <div className={`pin-map ${hasCarto ? '' : 'map-plain'}`}>
    <MapContainer center={value ?? landmarks[0]} zoom={15} maxBounds={bounds} maxBoundsViscosity={1} minZoom={11} className="map" scrollWheelZoom={false}>
      <MapTiles /><Pin value={value} onChange={onChange} />
    </MapContainer>
  </div>
}

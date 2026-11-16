import { useEffect } from 'react'
import { Pane, Polygon, Polyline, useMap } from 'react-leaflet'
import campus from '../data/campus-map.json'

const outlines = campus.buildings.map(points => [points])
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Local OSM geometry keeps the backdrop quiet, independent of raster tile styles.
export default function CampusMap() {
  const map = useMap()
  useEffect(() => {
    map.attributionControl?.setPrefix(false)
    map.attributionControl?.addAttribution(attribution)
    return () => { map.attributionControl?.removeAttribution(attribution) }
  }, [map])

  return <Pane name="campus-backdrop" style={{ zIndex: 200, pointerEvents: 'none' }}>
    <Polygon positions={outlines} interactive={false} className="campus-outlines" />
    <Polyline positions={campus.streets} interactive={false} className="campus-streets" />
  </Pane>
}

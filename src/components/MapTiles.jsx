import { TileLayer } from 'react-leaflet'
import { useTheme } from '../context/theme.js'
import { cartoKey, hasCarto } from '../lib/carto.js'

// Both lines have to stay visible on the map: it is what OpenStreetMap and
// CARTO ask for in return for free tiles.
const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const CARTO = `${OSM}, &copy; <a href="https://carto.com/attribution/">CARTO</a>`

// The base map. With a CARTO key: their light tiles in light mode and dark
// tiles in dark mode. Without one (a fresh clone, before anyone has asked for
// a key): ordinary OpenStreetMap tiles, so local development still works.
function MapTiles() {
  const { theme } = useTheme()

  if (!hasCarto) {
    return <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution={OSM} maxZoom={19} />
  }

  const style = theme === 'dark' ? 'dark_all' : 'light_all'
  return (
    <TileLayer
      // A new key makes React swap the whole layer when the theme changes,
      // instead of leaving old tiles on screen while new ones load over them.
      key={style}
      // URL format from carto.com/basemaps. {r} becomes "@2x" on sharp screens.
      url={`https://basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}{r}.png?key=${cartoKey}`}
      attribution={CARTO}
      maxNativeZoom={18}
      maxZoom={20}
    />
  )
}

export default MapTiles

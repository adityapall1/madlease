import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CircleMarker, MapContainer, Polygon } from 'react-leaflet'
import CampusMap from '../components/CampusMap.jsx'
import { useAuth } from '../context/auth.js'
import * as api from '../lib/api.js'
import LandingFaq from '../components/LandingFaq.jsx'
import { boundsOfAll, footprintToLatLngs } from '../lib/geo.js'
import { plural } from '../lib/format.js'
import { ArrowDown, ArrowUpRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.jsx'
import Reveal from '../components/Reveal.jsx'
import { useScrollScene } from '../lib/useScrollScene.js'
import { landmarks } from '../data/landmarks.js'

export default function Landing() {
  const { user, loading } = useAuth()
  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const scene = useScrollScene(!loading && !user)
  useEffect(() => {
    if (loading || user) return
    let stale = false
    Promise.all([api.fetchActiveListings(), api.fetchBuildings()]).then(([rows, buildings]) => {
      if (!stale) setData({ count: rows.length, buildings: buildings.filter((b) => rows.some((row) => row.building_id === b.id)) })
    }).catch(() => { if (!stale) setFailed(true) })
    return () => { stale = true }
  }, [user, loading, attempt])
  if (loading) return <div className="center-screen" role="status">Loading…</div>
  if (user) return <Navigate to="/browse" replace />
  return <div className="page landing">
    <section className="hero-story" ref={scene} aria-label="Find your place near campus">
    <div className="hero">
      <Reveal className="hero-intro">
        <p className="eyebrow">UW–Madison · Student subleases</p>
        <h1>Your next place.<br /><em>Closer to campus.</em></h1>
        <p className="hero-copy">Find a room for the semester or a home for the summer. Explore subleases on the map and connect directly with fellow Badgers.</p>
        <div className="form-actions"><Button asChild size="lg"><Link to="/browse">Browse subleases <ArrowUpRight aria-hidden="true" /></Link></Button><Button asChild variant="outline" size="lg"><Link to="/listings/new">Post your sublease</Link></Button></div>
        <p className="live-count" role="status">{data ? `${plural(data.count, 'active sublease')} to explore` : failed ? 'The live count is temporarily unavailable.' : 'Loading available subleases…'}</p>
        {failed && <button className="link" onClick={() => { setFailed(false); setAttempt(attempt + 1) }}>Retry live count</button>}
      </Reveal>
      <Reveal className="hero-map" delay={100}>
      <div className="map-paper">
      <div className="paper-label"><span>THE NEIGHBORHOOD EDIT</span><span>MADISON, WI</span></div>
      <div className="mini-map card" aria-label="Campus map and available sublease locations">
        <div>
          <MapContainer key={data?.buildings.length ? 'listings' : 'campus'} className="map" center={[landmarks[0].lat, landmarks[0].lng]} zoom={15} bounds={data?.buildings.length ? boundsOfAll(data.buildings) : undefined} boundsOptions={{ padding: [25, 25] }} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} boxZoom={false} keyboard={false}>
            <CampusMap />{(data?.buildings ?? []).map((b) => b.footprint ? <Polygon key={b.id} positions={footprintToLatLngs(b.footprint)} className="bldg" interactive={false} /> : <CircleMarker key={b.id} center={[b.lat, b.lng]} radius={7} className="bldg" interactive={false} />)}
          </MapContainer>
        </div>
        <span className="map-caption">Explore near campus</span>
      </div>
      <p className="map-footnote"><MapPin size={14} aria-hidden="true" /> A little closer to everything.</p>
      <span className="paper-seal" aria-hidden="true">Find your<br /><em>place.</em></span>
      </div>
      </Reveal>
      <a className="explore-cue" href="#why-madlease"><span className="scroll-track"><span /></span>Scroll to settle in <ArrowDown size={15} aria-hidden="true" /></a>
    </div>
    </section>
    <Reveal className="chapter-heading"><p className="eyebrow">A little less searching. A little more living.</p><h2>More than an address.<br /><em>Your next chapter.</em></h2><p>A walk to class. A favorite coffee spot. A place that feels like yours—even for a semester.</p></Reveal>
    <section id="why-madlease" className="landing-points" aria-label="Why MadLease">
      {[
        { title: 'For Badgers', icon: ShieldCheck, text: 'Sign in with your wisc.edu email to post, save, and contact students.' },
        { title: 'Start with the map', icon: MapPin, text: 'Compare buildings, dates, rent, and estimated walks to campus landmarks.' },
        { title: 'Free to use', icon: Sparkles, text: 'Browse and post without platform fees. Contact the poster directly.' },
      ].map(({ title, icon: Icon, text }, i) => <Reveal key={title} delay={i * 100}><Card className="feature-card"><CardHeader><div className="feature-top"><span className="feature-number">0{i + 1}</span><Icon size={20} aria-hidden="true" /></div><CardTitle>{title}</CardTitle></CardHeader><CardContent><p>{text}</p></CardContent></Card></Reveal>)}
    </section>
    <LandingFaq />
    <footer className="site-footer"><span>MadLease · A UW–Madison CS571 project</span><span>Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a></span></footer>
  </div>
}

import { Link } from 'react-router-dom'

export const projectUrl = 'https://github.com/adityapall1/madlease'

export default function SiteFooter() {
  return <footer className="site-footer editorial-footer">
    <div><Link to="/" className="footer-brand">MadLease</Link><p>A little closer to your next chapter.</p></div>
    <nav aria-label="Footer">
      <Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link>
      <Link to="/about">About</Link><Link to="/creators">Creators</Link><Link to="/contact">Contact Us</Link>
      <a href={projectUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
    </nav>
    <div className="footer-fine"><span>A UW–Madison CS571 student project · Not an official university service</span><span>Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a></span></div>
  </footer>
}

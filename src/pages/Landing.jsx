import { Link } from 'react-router-dom'

function Landing() {
  return (
    <section className="landing">
      <h1>MadLease</h1>
      <p>Find and post subleases around Madison on an interactive map.</p>
      <Link to="/browse" className="button">Browse subleases</Link>
    </section>
  )
}

export default Landing

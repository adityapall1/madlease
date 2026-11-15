import { Link } from 'react-router-dom'
import { ArrowUpRight, Plus } from 'lucide-react'
import { Button } from './ui/button.jsx'

const questions = [
  ['Can I look around before signing in?', 'Absolutely. Browse the map, compare rent, and explore available dates without an account. Sign in with your @wisc.edu email when you want to save a place, post a sublease, or view contact details.'],
  ['Can I find just a room?', 'Yes. Filter for a room or an entire unit, then narrow things down by rent, bedrooms, dates, and amenities. Check whether the listed rent is per person or for the whole unit.'],
  ['What if my classes aren’t near Bascom?', 'Choose a different campus landmark from the map’s Walk to menu. Walk estimates and closest-first sorting update together. These are distance-based estimates, not turn-by-turn routes.'],
  ['How do I contact someone about a place?', 'Open a listing and sign in to view the poster’s contact information. You arrange the details directly with them. Sample listings are marked as demos and cannot be contacted.'],
  ['Does MadLease handle the lease or payment?', 'No. MadLease helps students find each other; it does not verify listings, process rent, or approve subleases. Before committing, confirm the details with the poster and check the original lease and landlord’s requirements.'],
]

export default function LandingFaq() {
  return <>
    <section className="landing-faq" aria-labelledby="faq-heading">
      <div className="faq-intro">
        <p className="eyebrow">Before you unpack</p>
        <h2 id="faq-heading">A few things<br /><em>to feel at home.</em></h2>
        <p>New semester, new neighborhood, a few questions. Start here.</p>
      </div>
      <div className="faq-list">
        {questions.map(([question, answer]) => <details key={question}>
          <summary>{question}<Plus size={18} aria-hidden="true" /></summary>
          <p>{answer}</p>
        </details>)}
      </div>
    </section>
    <section className="landing-invitation" aria-labelledby="invitation-heading">
      <p className="eyebrow">Make room for what’s next</p>
      <h2 id="invitation-heading">One semester.<br /><em>A place of your own.</em></h2>
      <p>Find your next spot—or help another Badger find theirs.</p>
      <div className="form-actions">
        <Button asChild size="lg"><Link to="/browse">Find a place <ArrowUpRight aria-hidden="true" /></Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/listings/new">List your space</Link></Button>
      </div>
    </section>
  </>
}

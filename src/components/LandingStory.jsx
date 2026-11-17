import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal.jsx'

export default function LandingStory() {
  return <>
    <section className="landing-process" aria-labelledby="process-heading">
      <Reveal><p className="eyebrow">From looking to settling in</p><h2 id="process-heading">Less guesswork.<br /><em>More possibility.</em></h2><p className="section-intro">A small set of useful tools for a decision that matters.</p></Reveal>
      <div className="process-steps">{[
        ['01', 'Find your corner of Madison', 'Start on the map. See the neighborhood around a building and choose the campus landmark you want to walk to.'],
        ['02', 'Make the details line up', 'Filter by rent, dates, rooms, and amenities. Compare the things that affect your day-to-day life.'],
        ['03', 'Start a real conversation', 'Read the listing, ask the poster questions, and confirm the details together before making a commitment.'],
      ].map(([number, title, text]) => <Reveal key={number}><article><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article></Reveal>)}</div>
    </section>
    <Reveal><section className="creators-teaser" aria-labelledby="creators-teaser-heading"><div><p className="eyebrow">The people behind the map</p><h2 id="creators-teaser-heading">A campus project.<br /><em>A shared point of view.</em></h2></div><div><p>We’re three students building a more thoughtful way to explore subleases. Get to know the creators and see how the project comes together.</p><Link className="text-link" to="/creators">Meet the creators <ArrowUpRight size={17} aria-hidden="true" /></Link></div></section></Reveal>
  </>
}

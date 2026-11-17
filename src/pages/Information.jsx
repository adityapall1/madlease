import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, CodeXml as Github, BriefcaseBusiness as Linkedin, Globe } from 'lucide-react'
import SiteFooter, { projectUrl } from '../components/SiteFooter.jsx'

// Replace null values with the creators' public profile URLs when available.
const creators = [
  { name: 'Aditya Pall', initials: 'AP', links: { linkedin: 'https://www.linkedin.com/in/adityapall/', github: 'https://github.com/adityapall1', portfolio: 'https://adityapall.me' } },
  { name: 'Creator Two', initials: '02', placeholder: true, links: { linkedin: null, github: null, portfolio: null } },
  { name: 'Creator Three', initials: '03', placeholder: true, links: { linkedin: null, github: null, portfolio: null } },
]
const channels = [['linkedin', 'LinkedIn', Linkedin], ['github', 'GitHub', Github], ['portfolio', 'Portfolio', Globe]]
const pages = {
  about: ['The idea behind MadLease', 'Built around a place we know.', 'A focused way to explore student subleases around UW–Madison.'],
  creators: ['The people behind the project', 'Made by students. For students.', 'Three creators. One shared project: making the search for a place feel a little simpler.'],
  contact: ['Keep in touch', 'Good ideas start with a conversation.', 'Found a bug, have a suggestion, or want to help improve MadLease?'],
  privacy: ['Your information', 'Privacy Policy', 'A plain-language guide to the information used by this student project.'],
  terms: ['Using MadLease', 'Terms of Service', 'The ground rules for browsing, posting, and connecting with other students.'],
}
const privacy = [
  ['Browsing and local preferences', 'You can browse without an account. Your browser remembers your theme and walking destination. The test-listing toggle uses session storage for the current tab. Clearing site data removes these local preferences.'],
  ['Accounts and information you submit', 'When account services are configured, MadLease uses Supabase for email-code authentication, profiles, saved listings, and uploaded images. Profile fields, listing details, contact information, and photos you choose to submit are used to provide those features. Account services may be unavailable during the project preview.'],
  ['What other people can see', 'Active listing details are intended for public browsing. The interface requires sign-in to view a poster’s contact details. Uploaded listing photos and avatars use public image URLs, so do not upload sensitive documents or images you want kept private.'],
  ['Hosting and map services', 'The site is hosted on GitHub Pages. The campus backdrop is bundled with the app; the location picker can request tiles from OpenStreetMap or CARTO. These providers receive ordinary connection information when your browser contacts them and apply their own privacy policies.'],
  ['Your choices', 'Use the available profile and listing controls to edit your submissions, remove listings, or remove saved items. Clearing browser data does not delete server-side account data. For account or privacy questions, use the Contact page to find the project maintainers; do not publish private information in a public issue.'],
]
const terms = [
  ['A student project', 'MadLease is a UW–Madison CS571 project, not a university-operated service, landlord, broker, or property manager. Features and availability may change as the project develops.'],
  ['Listings and demo content', 'Demo listings are fictional and cannot be contacted. Real listings are submitted by users. MadLease does not verify property ownership, availability, pricing, or a poster’s authority to sublease. Confirm those details directly before making an agreement.'],
  ['Responsible participation', 'Only post accurate information and content you have permission to share. Do not impersonate others, publish private information without permission, harass people, discriminate, submit fraudulent listings, or interfere with the service. Use your own eligible email when account features are available.'],
  ['Agreements and payments', 'Students arrange viewings, approvals, leases, and payments directly. MadLease does not collect rent, approve subleases, or become a party to a rental agreement. Check the original lease and applicable requirements before committing. Walking times are estimates, not navigation instructions.'],
  ['Questions and reports', 'Use the Contact page to report technical problems or ask about the project. Public GitHub issues are suitable for non-sensitive bug reports; do not include passwords, private contact details, or rental documents.'],
]

export default function Information({ kind }) {
  const [eyebrow, title, intro] = pages[kind]
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); document.title = `${kind === 'creators' ? 'Creators' : title} · MadLease`; return () => { document.title = 'MadLease' } }, [kind, title])
  return <div className="page info-page">
    <header className="info-heading"><Link className="text-link" to="/">← Back to MadLease</Link><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="info-lead">{intro}</p></header>
    {kind === 'creators' && <><div className="creator-grid">{creators.map((person, i) => <article key={person.name} className={`creator-card ${i === 0 ? 'creator-primary' : ''}`}>
      <div className="creator-monogram" aria-hidden="true">{person.initials}</div><p className="eyebrow">{person.placeholder ? 'Name to be added' : 'Co-creator'}</p><h2>{person.name}</h2>
      <div className="creator-links">{channels.map(([key, label, Icon]) => person.links[key] ? <a key={key} href={person.links[key]} target="_blank" rel="noreferrer"><Icon size={16} />{label}<ArrowUpRight size={13} /></a> : <span key={key} aria-label={`${label} link coming soon`} title="Profile link coming soon"><Icon size={16} aria-hidden="true" />{label}</span>)}</div>
    </article>)}</div><div className="info-callout"><Github size={24} aria-hidden="true" /><div><h2>Built in the open.</h2><p>Explore the code, follow the project, or suggest an improvement.</p></div><a className="btn btn-outline" href={projectUrl} target="_blank" rel="noreferrer">Project on GitHub <ArrowUpRight size={16} /></a></div></>}
    {kind === 'about' && <div className="info-body"><section><h2>A place for the in-between.</h2><p>A summer in Madison. A semester abroad. A room that fits a new schedule. MadLease brings the details that matter—location, dates, rent, and the walk to campus—into one map-based experience.</p></section><section><h2>Useful before complicated.</h2><p>Start with the neighborhood, narrow the options, and read the details at your pace. We’re building a focused student project with transparent demo content and direct connections between posters and interested students.</p></section><section><h2>People make the project.</h2><p>MadLease was created for UW–Madison CS571. It is independently built by students and is not an official university housing service.</p><Link className="text-link" to="/creators">Meet the creators ↗</Link></section></div>}
    {kind === 'contact' && <div className="contact-grid"><section className="contact-card"><Github size={26} aria-hidden="true" /><h2>Feedback & bug reports</h2><p>Tell us what happened, what you expected, and which browser you used. Screenshots help—remove any personal information first.</p><a className="btn btn-primary" href={`${projectUrl}/issues`} target="_blank" rel="noreferrer">Open GitHub issues <ArrowUpRight size={16} /></a><small>GitHub issues are public. A GitHub account is needed to post.</small></section><section className="contact-card"><h2>Connect with the creators</h2><p>Find the team and their profile links on the creators page. Personal links will appear as the team adds them.</p><Link className="text-link" to="/creators">Meet the team ↗</Link><hr /><p>For questions about a rental, contact its poster through the listing when account services are available. The project team does not manage properties.</p></section></div>}
    {(kind === 'privacy' || kind === 'terms') && <div className="info-body"><p className="policy-date">Updated November 17, 2026 · Student project preview</p>{(kind === 'privacy' ? privacy : terms).map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}<Link className="text-link" to="/contact">Questions? Contact the team ↗</Link></div>}
    <SiteFooter />
  </div>
}

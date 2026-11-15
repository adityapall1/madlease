import { BadgeCheck, Copy, Mail, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import { useToast } from '../context/toast.js'
import * as api from '../lib/api.js'
import { signInPath } from '../lib/paths.js'
import Avatar from './Avatar.jsx'

// Who posted a listing, and how to reach them. Signed-out visitors never see
// this: the database won't hand a profile to anyone who isn't signed in, and
// this card doesn't even ask.
function PosterCard({ listing }) {
  const { user } = useAuth()
  const location = useLocation()
  const toast = useToast()
  const [loaded, setLoaded] = useState(null)
  const [failed, setFailed] = useState(false)

  const signedIn = Boolean(user)
  const ownerId = listing.owner_id
  const poster = loaded?.viewer === user?.id && loaded?.owner === ownerId ? loaded.row : null

  useEffect(() => {
    if (!signedIn || !ownerId) return
    let stale = false
    api
      .fetchProfile(ownerId)
      .then((row) => {
        if (stale) return
        if (row) setLoaded({ viewer: user.id, owner: ownerId, row })
        else setFailed(true)
      })
      .catch(() => {
        if (!stale) setFailed(true)
      })
    return () => {
      stale = true
    }
  }, [signedIn, ownerId, user?.id])

  if (listing.is_demo) {
    return (
      <section className="poster card" aria-label="Posted by">
        <div className="poster-who">
          <Avatar profile={{ full_name: 'Demo' }} size={44} />
          <div>
            <p className="poster-name">Demo listing</p>
            <p className="muted small">Sample data so you can try the site. There is nobody to contact.</p>
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-block" disabled>
          <Mail aria-hidden="true" />
          Contact
        </button>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="poster card" aria-label="Posted by">
        <p>Sign in to see who posted this and contact them.</p>
        <Link to={signInPath(location)} className="btn btn-primary btn-block">
          <Mail aria-hidden="true" />
          Sign in to contact
        </Link>
      </section>
    )
  }

  if (failed) {
    return (
      <section className="poster card" aria-label="Posted by">
        <p className="muted">We couldn't load who posted this. Try reloading the page.</p>
      </section>
    )
  }

  if (!poster) {
    return (
      <section className="poster card" aria-label="Posted by" aria-busy="true">
        <div className="poster-who">
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 140, height: 16 }} />
        </div>
      </section>
    )
  }

  const name = poster.full_name || 'UW student'
  const first = poster.full_name ? poster.full_name.split(' ')[0] : 'there'
  const about = [poster.major, poster.grad_year && `Class of ${poster.grad_year}`].filter(Boolean).join(' · ')

  // Opens the visitor's own email app with a draft, so nothing is sent
  // through us and the poster's reply goes straight to them.
  const subject = `MadLease: ${listing.title}`
  const body = `Hi ${first},\n\nI saw your sublease "${listing.title}" on MadLease and I'm interested. Is it still available?\n\nThanks!`
  const mailto = `mailto:${poster.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(poster.email)
      toast('Email address copied.')
    } catch {
      // Clipboard access can be blocked. Show the address so it can be copied by hand.
      toast(`Couldn't copy. The address is ${poster.email}`)
    }
  }

  return (
    <section className="poster card" aria-label="Posted by">
      <div className="poster-who">
        <Avatar profile={poster} size={44} />
        <div>
          <p className="poster-name">
            {name}
            <span className="tag tag-accent">
              <BadgeCheck aria-hidden="true" />
              UW verified
            </span>
          </p>
          {about && <p className="muted small">{about}</p>}
        </div>
      </div>

      {poster.bio && <p className="poster-bio">{poster.bio}</p>}

      {poster.phone && (
        <p className="poster-phone">
          <Phone aria-hidden="true" />
          <a href={`tel:${poster.phone}`}>{poster.phone}</a>
        </p>
      )}

      <div className="poster-actions">
        <a href={mailto} className="btn btn-primary">
          <Mail aria-hidden="true" />
          Contact
        </a>
        <button type="button" className="btn btn-outline" onClick={copy}>
          <Copy aria-hidden="true" />
          Copy email
        </button>
      </div>
    </section>
  )
}

export default PosterCard

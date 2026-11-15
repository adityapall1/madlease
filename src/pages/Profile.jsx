import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import ListingCard from '../components/ListingCard.jsx'
import { useAuth } from '../context/auth.js'
import { useSaved } from '../context/saved.js'
import { useToast } from '../context/toast.js'
import * as api from '../lib/api.js'
import { dataMessage } from '../lib/errors.js'
import { today } from '../lib/format.js'
import { resizeImage } from '../lib/images.js'
import { safeNext } from '../lib/paths.js'

function ProfileEditor({ profile, onSaved, onCancel }) {
  const { user, refreshProfile } = useAuth()
  const [fields, setFields] = useState({ full_name: profile.full_name ?? '', major: profile.major ?? '', grad_year: profile.grad_year ?? '', bio: profile.bio ?? '', phone: profile.phone ?? '' })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  const change = (key, value) => setFields((old) => ({ ...old, [key]: value }))
  async function pick(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setPreparing(true)
    setError('')
    try { const blob = await resizeImage(file, true); setPhoto(blob); setPreview(URL.createObjectURL(blob)) }
    catch (err) { setError(err.message) }
    setPreparing(false)
  }
  async function save(event) {
    event.preventDefault()
    if (lock.current || preparing) return
    if (!fields.full_name.trim()) { setError('Enter your name.'); return }
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const next = { ...fields, full_name: fields.full_name.trim(), major: fields.major.trim(), bio: fields.bio.trim(), phone: fields.phone.trim(), grad_year: fields.grad_year ? Number(fields.grad_year) : null }
      if (photo) {
        next.avatar_path = `${user.id}/avatar.webp`
        await api.uploadAvatar(next.avatar_path, photo)
      }
      const updated = await api.updateProfile(user.id, next)
      await refreshProfile()
      onSaved(updated)
    } catch (err) { setError(dataMessage(err, 'Could not save your profile. Your entries are still here.')) }
    lock.current = false
    setBusy(false)
  }
  return <form className="editor" onSubmit={save}>
    <fieldset disabled={busy || preparing} className="form-section">
      <div className="profile-avatar">{preview ? <img className="avatar-preview" src={preview} alt="New avatar preview" /> : <Avatar profile={profile} size={80} />}<label className="field">Change avatar<input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} /><span className="hint">Centered square crop, resized to 512 pixels.</span></label></div>
      <label className="field">Name<input className="input" required maxLength={80} value={fields.full_name} onChange={(e) => change('full_name', e.target.value)} /></label>
      <label className="field">UW email<input className="input" value={user.email} readOnly /></label>
      <div className="form-grid"><label className="field">Major<input className="input" maxLength={80} value={fields.major} onChange={(e) => change('major', e.target.value)} /></label><label className="field">Graduation year<input className="input" type="number" min="2020" max="2035" value={fields.grad_year} onChange={(e) => change('grad_year', e.target.value)} /></label></div>
      <label className="field">Bio<textarea className="textarea" maxLength={300} value={fields.bio} onChange={(e) => change('bio', e.target.value)} /><span className="counter">{fields.bio.length}/300</span></label>
      <label className="field">Phone (optional)<input className="input" type="tel" maxLength={30} value={fields.phone} onChange={(e) => change('phone', e.target.value)} /><span className="hint">Only signed-in students can see your contact details.</span></label>
    </fieldset>
    {error && <p className="note note-error" role="alert">{error}</p>}
    {preparing && <p role="status">Preparing avatar…</p>}
    <div className="form-actions"><button className="btn btn-primary" disabled={busy || preparing}>{busy ? 'Saving…' : 'Save profile'}</button><button className="btn btn-outline" type="button" disabled={busy} onClick={onCancel}>Cancel</button></div>
  </form>
}

function DeleteDialog({ listing, onClose, onDelete }) {
  const dialog = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  useEffect(() => { const el = dialog.current; el.showModal(); return () => el.close() }, [])
  async function remove() {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    try { const result = await api.deleteListing(listing); onDelete(listing, result) }
    catch (err) { setError(dataMessage(err, 'Could not delete this listing.')); setBusy(false); lock.current = false }
  }
  return <dialog ref={dialog} className="dialog" aria-labelledby="delete-title" onCancel={(e) => { e.preventDefault(); if (!busy) onClose() }}>
    <h2 id="delete-title">Delete this sublease?</h2><p>“{listing.title}” and its photos will be removed. This cannot be undone.</p>
    {error && <p role="alert" className="error-text">{error}</p>}
    <div className="dialog-actions"><button className="btn btn-outline" autoFocus disabled={busy} onClick={onClose}>Cancel</button><button className="btn btn-danger" disabled={busy} onClick={remove}>{busy ? 'Deleting…' : 'Delete listing'}</button></div>
  </dialog>
}

export default function Profile() {
  const { user, profile } = useAuth()
  const saved = useSaved()
  const toast = useToast()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const welcome = params.get('welcome') === '1'
  const [editing, setEditing] = useState(welcome)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(null)
  const [cleanup, setCleanup] = useState([])
  const lock = useRef(false)
  useEffect(() => {
    let stale = false
    Promise.all([api.fetchProfile(user.id), api.fetchMyListings(user.id), api.fetchSaved(user.id)]).then(([person, mine, savedRows]) => {
      if (!stale) setData({ person, mine, savedRows })
    }).catch((err) => { if (!stale) setError(dataMessage(err, 'Could not load your profile.')) })
    return () => { stale = true }
  }, [user.id, attempt])
  async function update(row, clean = false) {
    if (lock.current) return
    lock.current = true
    setBusy(row.id)
    try {
      if (clean) { await api.cleanupListingPhotos(row); toast('Unused photos removed.') }
      else {
        const updated = await api.updateListing(row.id, { status: row.status === 'active' ? 'taken' : 'active' })
        setData((old) => ({ ...old, mine: old.mine.map((r) => r.id === row.id ? updated : r) }))
        toast(updated.end_date < today() ? 'Status updated. Edit the expired dates to show this in Browse.' : 'Listing status updated.')
      }
    } catch (err) { toast(dataMessage(err, 'Could not update this listing. Try again.')) }
    setBusy(null)
    lock.current = false
  }
  async function retryCleanup(row) {
    if (lock.current) return
    lock.current = true
    setBusy(row.id)
    try { await api.cleanupListingPhotos(row, true); setCleanup((rows) => rows.filter((r) => r.id !== row.id)); toast('Photos removed.') }
    catch { toast('Photo cleanup failed. Please try again.') }
    setBusy(null)
    lock.current = false
  }
  if (error) return <div className="page"><p role="alert">{error}</p><button className="btn btn-outline" onClick={() => { setError(''); setAttempt(attempt + 1) }}>Retry</button></div>
  if (!data) return <div className="page" role="status">Loading your profile…</div>
  const person = profile ?? data.person ?? { email: user.email }
  const availableSaved = data.savedRows.filter((row) => !saved.ready || saved.ids.has(row.listing_id))
  return <div className="page profile-page">
    <h1>Your profile</h1>
    {welcome && <p className="note">Finish setting up your profile so students know who they're contacting.</p>}
    <section className="card profile-header">
      {editing ? <ProfileEditor profile={person} onCancel={() => setEditing(false)} onSaved={(updated) => {
        setData((old) => ({ ...old, person: updated })); setEditing(false); toast('Profile saved.')
        if (welcome) navigate(safeNext(params.get('next')) ?? '/browse', { replace: true })
      }} /> : <>
        <div className="profile-avatar"><Avatar profile={person} size={80} /><div><h2>{person.full_name || 'UW student'}</h2><span className="tag tag-accent">UW verified</span><p>{user.email}</p></div></div>
        <p>{[person.major, person.grad_year && `Class of ${person.grad_year}`].filter(Boolean).join(' · ')}</p>
        {person.bio && <p className="detail-text">{person.bio}</p>}{person.phone && <p>{person.phone}</p>}
        <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit profile</button>
      </>}
    </section>
    <section aria-labelledby="my-listings"><div className="section-head"><h2 id="my-listings">My listings</h2><Link className="btn btn-primary btn-sm" to="/listings/new">Post a sublease</Link></div>
      {data.mine.length === 0 && <p className="muted">You haven't posted a sublease yet.</p>}
      <ul className="cards">{data.mine.map((row) => <ListingCard key={row.id} listing={row} to={`/browse/listings/${row.id}`} badge={<span className="tag">{row.end_date < today() ? 'Expired' : row.status === 'taken' ? 'Taken' : 'Active'}</span>} actions={<>
        <Link className="btn btn-outline btn-sm" to={`/listings/${row.id}/edit`}>Edit</Link>
        <button className="btn btn-outline btn-sm" disabled={busy !== null} onClick={() => update(row)}>{row.status === 'active' ? 'Mark as taken' : 'Reactivate'}</button>
        <button className="btn btn-outline btn-sm" disabled={busy !== null} onClick={() => update(row, true)}>Clean unused photos</button>
        <button className="btn btn-danger btn-sm" onClick={() => setRemoving(row)}>Delete</button>
      </>} />)}</ul>
      {cleanup.map((row) => <div className="note" key={row.id}><span>“{row.title}” was deleted, but its photos still need cleanup.</span><button className="btn btn-outline btn-sm" disabled={busy !== null} onClick={() => retryCleanup(row)}>Retry cleanup</button></div>)}
    </section>
    <section aria-labelledby="saved-listings"><h2 id="saved-listings">Saved</h2>
      {saved.failed && <p role="alert">Could not load saved status. <button className="link" onClick={saved.retry}>Retry</button></p>}
      {availableSaved.length === 0 && <p className="muted">No saved subleases yet. Tap a heart in Browse to keep one here.</p>}
      <ul className="cards">{availableSaved.map((row) => row.listing ? <ListingCard key={row.listing_id} listing={row.listing} to={`/browse/listings/${row.listing_id}`} /> : <li className="card unavailable" key={row.listing_id}><p>No longer available</p><button className="btn btn-outline btn-sm" disabled={!saved.ready || saved.pending.has(`${user.id}/${row.listing_id}`)} onClick={() => saved.toggle(row.listing_id)}>Remove from saved</button></li>)}</ul>
    </section>
    {removing && <DeleteDialog listing={removing} onClose={() => setRemoving(null)} onDelete={(row, result) => {
      setData((old) => ({ ...old, mine: old.mine.filter((r) => r.id !== row.id), savedRows: old.savedRows.filter((r) => r.listing_id !== row.id) }))
      if (result.cleanupFailed) setCleanup((rows) => [...rows, row])
      setRemoving(null); toast('Listing deleted.')
    }} />}
  </div>
}

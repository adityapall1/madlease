import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PinMap from '../components/PinMap.jsx'
import { useAuth } from '../context/auth.js'
import { useToast } from '../context/toast.js'
import * as api from '../lib/api.js'
import { AMENITIES } from '../lib/constants.js'
import { dataMessage } from '../lib/errors.js'
import { resizeImage } from '../lib/images.js'
import { listingError } from '../lib/validation.js'

const empty = { building_id: '', unit_type: 'entire', beds: 1, baths: 1, roommates: 1, rent: '', rent_basis: 'whole_unit', furnished: false, amenities: [], start_date: '', end_date: '', title: '', description: '' }

function Editor({ row, buildings }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [fields, setFields] = useState(row ? { ...empty, ...row } : empty)
  const [search, setSearch] = useState('')
  const [custom, setCustom] = useState(false)
  const [address, setAddress] = useState('')
  const [pin, setPin] = useState(null)
  const [photos, setPhotos] = useState((row?.photos ?? []).map((path) => ({ key: path, path, url: api.photoUrl(path) })))
  const [busy, setBusy] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState('')
  const urls = useRef([])
  const draft = useRef(row?.id ?? null)
  const place = useRef(null)
  const uploads = useRef(new Map())
  const locked = useRef(false)
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), [])
  const change = (key, value) => setFields((prev) => ({ ...prev, [key]: value }))
  const choices = buildings.filter((b) => b.id === fields.building_id || `${b.name} ${b.address}`.toLowerCase().includes(search.toLowerCase()))

  async function addPhotos(event) {
    const files = Array.from(event.target.files)
    event.target.value = ''
    if (files.length + photos.length > 6) { setError('Choose no more than six photos.'); return }
    setPreparing(true)
    setError('')
    try {
      const added = []
      for (const file of files) {
        const blob = await resizeImage(file)
        const url = URL.createObjectURL(blob)
        urls.current.push(url)
        added.push({ key: crypto.randomUUID(), blob, url })
      }
      setPhotos((prev) => [...prev, ...added])
    } catch (err) { setError(err.message) }
    setPreparing(false)
  }

  async function submit(event) {
    event.preventDefault()
    if (locked.current || preparing) return
    const next = {
      building_id: fields.building_id, unit_type: fields.unit_type,
      beds: Number(fields.beds), baths: Number(fields.baths),
      roommates: fields.unit_type === 'room' ? Number(fields.roommates ?? 1) : null,
      rent: Number(fields.rent), rent_basis: fields.unit_type === 'room' ? 'per_person' : fields.rent_basis,
      furnished: fields.furnished, amenities: fields.amenities, start_date: fields.start_date,
      end_date: fields.end_date, title: fields.title.trim(), description: fields.description.trim(),
    }
    const invalid = listingError(next) || (custom ? (!address.trim() || !pin ? 'Enter an address and place a pin on the map.' : '') : (!next.building_id ? 'Choose a building.' : ''))
    if (invalid) { setError(invalid); return }
    locked.current = true
    setBusy(true)
    setError('')
    try {
      if (custom) {
        const key = JSON.stringify([address.trim(), pin])
        if (place.current?.key !== key) {
          const building = await api.createBuilding({ name: address.trim().slice(0, 80), address: address.trim(), ...pin, created_by: user.id })
          place.current = { key, id: building.id }
        }
        next.building_id = place.current.id
      }
      // Keep a partial upload private, and reuse its id on retry.
      if (!draft.current) {
        const created = await api.createListing({ ...next, owner_id: user.id, status: 'taken', photos: [] })
        draft.current = created.id
      }
      const paths = []
      for (const photo of photos) {
        let path = photo.path ?? uploads.current.get(photo.key)
        if (!path) {
          path = `${user.id}/${draft.current}/${Date.now()}-${photo.key}.webp`
          await api.uploadPhoto(path, photo.blob)
          uploads.current.set(photo.key, path)
        }
        paths.push(path)
      }
      await api.updateListing(draft.current, { ...next, photos: paths, status: row?.status ?? 'active' })
      const removed = [...(row?.photos ?? []), ...uploads.current.values()].filter((path) => !paths.includes(path))
      try { await api.removePhotos(removed) } catch { toast('Listing saved. Some unused photos could not be removed; use photo cleanup on your profile.') }
      navigate(`/browse/listings/${draft.current}`)
    } catch (err) { setError(dataMessage(err, 'Could not save. Your entries are still here; try again.')) }
    locked.current = false
    setBusy(false)
  }

  return <form className="editor" onSubmit={submit}>
    <fieldset disabled={busy || preparing}>
      <section className="form-section card">
        <h2>1. Location</h2>
        <label className="check"><input type="checkbox" checked={custom} onChange={(e) => setCustom(e.target.checked)} /> My place isn't listed</label>
        {!custom ? <>
          <label className="field">Search buildings<input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Building or street" /></label>
          <label className="field">Building<select className="select" required value={fields.building_id} onChange={(e) => change('building_id', e.target.value)}><option value="">Choose a building</option>{choices.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.address}</option>)}</select></label>
        </> : <>
          <label className="field">Street address<input className="input" required maxLength={120} value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <p className="hint">Click to place a pin, then drag to adjust. With a keyboard, focus the map, use arrow keys to pan, then choose Use map center.</p>
          <PinMap value={pin} onChange={setPin} />
          <p role="status" className="hint">{pin ? 'Location selected inside Madison.' : 'Choose the exact location before saving.'}</p>
        </>}
      </section>
      <section className="form-section card">
        <h2>2. Unit</h2>
        <label className="field">What's on offer<select className="select" value={fields.unit_type} onChange={(e) => change('unit_type', e.target.value)}><option value="entire">Whole unit</option><option value="room">Room in a shared unit</option></select></label>
        <div className="form-grid">
          <label className="field">Bedrooms (0 for studio)<input className="input" type="number" min="0" max="8" required value={fields.beds} onChange={(e) => change('beds', e.target.value)} /></label>
          <label className="field">Bathrooms<input className="input" type="number" min="0.5" max="8" step="0.5" required value={fields.baths} onChange={(e) => change('baths', e.target.value)} /></label>
          {fields.unit_type === 'room' && <label className="field">Roommates<input className="input" type="number" min="1" max="10" required value={fields.roommates ?? 1} onChange={(e) => change('roommates', e.target.value)} /></label>}
        </div>
        <label className="check"><input type="checkbox" checked={fields.furnished} onChange={(e) => change('furnished', e.target.checked)} /> Furnished</label>
        <div className="amenity-grid">{AMENITIES.map((a) => <label className="check" key={a.id}><input type="checkbox" checked={fields.amenities.includes(a.id)} onChange={(e) => change('amenities', e.target.checked ? [...fields.amenities, a.id] : fields.amenities.filter((id) => id !== a.id))} />{a.label}</label>)}</div>
      </section>
      <section className="form-section card">
        <h2>3. Price</h2>
        <div className="form-grid">
          <label className="field">Monthly rent ($)<input className="input" type="number" min="100" max="10000" required value={fields.rent} onChange={(e) => change('rent', e.target.value)} /></label>
          <label className="field">Price covers<select className="select" value={fields.unit_type === 'room' ? 'per_person' : fields.rent_basis} disabled={fields.unit_type === 'room'} onChange={(e) => change('rent_basis', e.target.value)}><option value="per_person">One person</option><option value="whole_unit">The whole unit</option></select></label>
        </div>
        <p className="note">{fields.unit_type === 'room' || fields.rent_basis === 'per_person' ? 'This is what one person pays each month.' : 'This is the total monthly rent for the entire unit.'}</p>
      </section>
      <section className="form-section card">
        <h2>4. Dates</h2>
        <div className="form-grid"><label className="field">Start date<input className="input" type="date" required value={fields.start_date} onInput={(e) => change('start_date', e.target.value)} /></label><label className="field">End date<input className="input" type="date" required min={fields.start_date || undefined} value={fields.end_date} onInput={(e) => change('end_date', e.target.value)} /></label></div>
      </section>
      <section className="form-section card">
        <h2>5. Photos</h2>
        <label className="field">Add photos ({photos.length}/6)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} disabled={photos.length >= 6} /></label>
        <p className="hint">The first photo is the cover. Images are resized before upload.</p>
        <div className="photo-grid">{photos.map((photo, i) => <div key={photo.key} className="photo-edit"><img src={photo.url} alt={`Listing photo ${i + 1}`} /><button type="button" className="btn btn-outline btn-sm" disabled={i === 0} onClick={() => setPhotos([photo, ...photos.filter((p) => p.key !== photo.key)])}>{i === 0 ? 'Cover photo' : 'Make cover'}</button><button type="button" className="link" aria-label={`Remove photo ${i + 1}`} onClick={() => setPhotos(photos.filter((p) => p.key !== photo.key))}>Remove</button></div>)}</div>
      </section>
      <section className="form-section card">
        <h2>6. Tell students about it</h2>
        <label className="field">Title<input className="input" required minLength={3} maxLength={80} value={fields.title} onChange={(e) => change('title', e.target.value)} /><span className="counter">{fields.title.length}/80</span></label>
        <label className="field">Description<textarea className="textarea" maxLength={2000} value={fields.description} onChange={(e) => change('description', e.target.value)} /><span className="counter">{fields.description.length}/2000</span></label>
      </section>
    </fieldset>
    {error && <p className="note note-error" role="alert">{error}</p>}
    {preparing && <p role="status">Preparing photos…</p>}
    <div className="form-actions"><button className="btn btn-primary" disabled={busy || preparing}>{busy ? 'Saving…' : row ? 'Save changes' : 'Post sublease'}</button><Link className="btn btn-outline" to="/profile">Back to profile</Link></div>
  </form>
}

export default function ListingForm() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let stale = false
    Promise.all([api.fetchBuildings(), id ? api.fetchListing(id) : null]).then(([buildings, row]) => {
      if (stale) return
      if (id && (!row || row.owner_id !== user.id)) setError('Only the owner can edit this listing, or it is no longer available.')
      else setData({ buildings, row, id })
    }).catch((err) => { if (!stale) setError(dataMessage(err, 'Could not load the form. Try again.')) })
    return () => { stale = true }
  }, [id, user.id, attempt])
  return <div className="page page-form"><h1>{id ? 'Edit sublease' : 'Post your sublease'}</h1>
    {error ? <div role="alert"><p>{error}</p><button className="btn btn-outline" onClick={() => { setError(''); setAttempt(attempt + 1) }}>Retry</button></div> : data && data.id === id ? <Editor key={id ?? 'new'} {...data} /> : <p role="status">Loading form…</p>}
  </div>
}

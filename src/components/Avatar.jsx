import { avatarUrl } from '../lib/api.js'

// A person's photo, or the first letter of their name when they have none.
// Decorative on its own: whatever sits next to it should carry the name.
function Avatar({ profile, size = 32 }) {
  const url = avatarUrl(profile)
  const letter = (profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }} aria-hidden="true">
      {url ? <img src={url} alt="" /> : letter}
    </span>
  )
}

export default Avatar

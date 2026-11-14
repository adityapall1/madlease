import { LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import Avatar from './Avatar.jsx'

function AvatarMenu() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const navigate = useNavigate()

  // While open, a click anywhere else or the Escape key closes the menu.
  useEffect(() => {
    if (!open) return

    function onDown(event) {
      if (!wrap.current.contains(event.target)) setOpen(false)
    }
    function onKey(event) {
      if (event.key !== 'Escape') return
      // Marks the key as handled so browse doesn't also clear its selection.
      event.preventDefault()
      setOpen(false)
    }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function leave() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div className="menu-wrap" ref={wrap}>
      <button
        type="button"
        className="avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen(!open)}
      >
        <Avatar profile={profile ?? { email: user.email }} />
      </button>

      {open && (
        <div className="menu" role="menu">
          <div className="menu-head">{profile?.full_name || user.email}</div>
          <Link to="/profile" className="menu-item" role="menuitem" onClick={() => setOpen(false)}>
            <User aria-hidden="true" />
            Profile
          </Link>
          <button type="button" className="menu-item" role="menuitem" onClick={leave}>
            <LogOut aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default AvatarMenu

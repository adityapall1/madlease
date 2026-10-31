import { NavLink, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Browse from './pages/Browse.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  return (
    <>
      <nav className="nav">
        <span className="nav-brand">MadLease</span>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/browse">Browse</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </>
  )
}

export default App

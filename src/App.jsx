
import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Browse from './pages/Browse.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  const [user, setUser] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '',
    preferences: {
      location: 'Madison, WI',
      budget: '$800 - $1,200',
      bedrooms: '1',
      moveInDate: '',
    },
  })

  const [savedApartmentIds, setSavedApartmentIds] = useState([])
  const [postedSubleases, setPostedSubleases] = useState([])

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

          <Route
            path="/browse"
            element={
              <Browse
                savedApartmentIds={savedApartmentIds}
                setSavedApartmentIds={setSavedApartmentIds}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                setUser={setUser}
                savedApartmentIds={savedApartmentIds}
                postedSubleases={postedSubleases}
                setPostedSubleases={setPostedSubleases}
              />
            }
          />
        </Routes>
      </main>
    </>
  )
}

export default App

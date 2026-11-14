import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import ThemeProvider from './context/ThemeProvider.jsx'
import Browse from './pages/Browse.jsx'
import Landing from './pages/Landing.jsx'
import ListingForm from './pages/ListingForm.jsx'
import NotFound from './pages/NotFound.jsx'
import Profile from './pages/Profile.jsx'
import SignIn from './pages/SignIn.jsx'

function App() {
  return (
    <ThemeProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          {/* The listing detail is a child of Browse, not its own page, so the
              map stays mounted while the left panel swaps list for detail. */}
          <Route path="/browse" element={<Browse />}>
            <Route path="listings/:id" element={null} />
          </Route>
          <Route path="/profile" element={<Profile />} />
          <Route path="/listings/new" element={<ListingForm />} />
          <Route path="/listings/:id/edit" element={<ListingForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </ThemeProvider>
  )
}

export default App

import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import ThemeProvider from './context/ThemeProvider.jsx'
import Browse from './pages/Browse.jsx'
import Landing from './pages/Landing.jsx'
import ListingForm from './pages/ListingForm.jsx'
import NotFound from './pages/NotFound.jsx'
import Profile from './pages/Profile.jsx'
import SignIn from './pages/SignIn.jsx'

// Pages that need an account. Signed-out visitors are sent to sign in first.
const guard = (page) => <RequireAuth>{page}</RequireAuth>

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
            <Route path="/profile" element={guard(<Profile />)} />
            <Route path="/listings/new" element={guard(<ListingForm />)} />
            <Route path="/listings/:id/edit" element={guard(<ListingForm />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import SavedProvider from './context/SavedProvider.jsx'
import ThemeProvider from './context/ThemeProvider.jsx'
import ToastProvider from './context/ToastProvider.jsx'
import NotFound from './pages/NotFound.jsx'
import SignIn from './pages/SignIn.jsx'

const Browse = lazy(() => import('./pages/Browse.jsx'))
const Landing = lazy(() => import('./pages/Landing.jsx'))
const ListingForm = lazy(() => import('./pages/ListingForm.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Information = lazy(() => import('./pages/Information.jsx'))

// Pages that need an account. Signed-out visitors are sent to sign in first.
const guard = (page) => <RequireAuth>{page}</RequireAuth>

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <SavedProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Nav />
            <main id="main">
              <Suspense fallback={<div className="center-screen" role="status">Loading…</div>}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signin" element={<SignIn />} />
                {['about', 'creators', 'contact', 'privacy', 'terms'].map(kind => <Route key={kind} path={`/${kind}`} element={<Information kind={kind} />} />)}
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
              </Suspense>
            </main>
          </SavedProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

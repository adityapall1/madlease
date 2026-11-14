import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import MissingEnv from './components/MissingEnv.jsx'
import { hasEnv } from './lib/supabase.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {hasEnv ? (
      // The site lives under /madlease/ on GitHub Pages. BASE_URL comes from
      // `base` in vite.config.js, so the router and the build always agree.
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    ) : (
      <MissingEnv />
    )}
  </StrictMode>,
)

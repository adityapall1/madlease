import { useCallback, useEffect, useState } from 'react'
import { ToastContext } from './toast.js'

function ToastProvider({ children }) {
  const [message, setMessage] = useState(null)

  // `id` changes with every toast, so showing the same text twice in a row
  // still restarts the timer.
  const toast = useCallback((text) => setMessage({ text, id: Date.now() }), [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Always in the page, even when empty, so screen readers announce new text. */}
      <div className="toast-area" role="status" aria-live="polite">
        {message && <div className="toast">{message.text}</div>}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider

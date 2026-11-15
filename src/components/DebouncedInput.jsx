import { useEffect, useRef, useState } from 'react'

// A text input that waits until typing pauses before reporting the new value.
// The filters live in the URL, and rewriting the URL on every keystroke would
// re-filter the list and redraw the map mid-word.
//
//   value     the committed value (from the URL)
//   onCommit  called with the new text once typing has paused
//   clean     optional function to tidy each keystroke, e.g. strip non-digits
function DebouncedInput({ value, onCommit, clean, delay = 350, ...rest }) {
  const [text, setText] = useState(value)

  // Follow changes that come from outside: Clear filters, or the back button.
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    setText(value)
  }

  // Kept in a ref so that a parent re-rendering (which makes a new onCommit
  // function each time) doesn't restart the timer.
  const commit = useRef(onCommit)
  useEffect(() => {
    commit.current = onCommit
  })

  useEffect(() => {
    if (text === value) return
    const timer = setTimeout(() => commit.current(text), delay)
    return () => clearTimeout(timer)
  }, [text, value, delay])

  return <input {...rest} value={text} onChange={(e) => setText(clean ? clean(e.target.value) : e.target.value)} />
}

export default DebouncedInput

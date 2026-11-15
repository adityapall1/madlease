// Where to send someone after they sign in. Only paths inside this site are
// allowed: "//evil.com" and "/\evil.com" both look like paths but browsers
// treat them as other websites.
export function safeNext(value) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  return value
}

// The sign-in link for "come back to where I am now".
export function signInPath(location) {
  const here = location.pathname + location.search
  return `/signin?next=${encodeURIComponent(here)}`
}

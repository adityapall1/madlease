// Turns errors from Supabase into sentences a student can act on.

const OFFLINE = "Couldn't reach the server. Check your connection and try again."

function isNetwork(error) {
  return error?.name === 'AuthRetryableFetchError' || /failed to fetch|networkerror|load failed/i.test(error?.message ?? '')
}

// Errors from sending or checking a sign-in code.
export function authMessage(error) {
  const code = error?.code ?? ''
  const text = error?.message ?? ''

  if (isNetwork(error)) return OFFLINE

  if (error?.status === 429 || code.includes('rate_limit')) {
    return 'Too many codes requested, try again in a bit.'
  }

  // Until we set up our own email sender, Supabase only delivers codes to
  // people on the project's team.
  if (code === 'email_address_not_authorized' || /not authorized/i.test(text)) {
    return "While we're testing, only addresses on our Supabase team can receive codes. Ask a teammate to add you, or check back once the site is open to everyone."
  }

  if (code === 'otp_expired' || /expired|invalid/i.test(text)) {
    return 'That code is wrong or has expired. Check it and try again, or request a new one.'
  }

  // The sign-up hook writes its own sentence ("Use your @wisc.edu email to
  // sign up."), so pass it through as is.
  return text || 'Something went wrong. Please try again.'
}

// Errors from reading or saving data.
export function dataMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (isNetwork(error)) return OFFLINE

  // 42501 is the database refusing on permissions, which for a signed-in user
  // almost always means the session ran out.
  if (error?.code === '42501') return "You don't have permission to do that. Try signing in again."

  // 23514 is a check constraint: the database rejected a value the form let through.
  if (error?.code === '23514') return "Some of those details aren't allowed. Check the form and try again."

  return fallback
}

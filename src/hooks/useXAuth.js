// X OAuth 2.0 PKCE — public client (no secret needed)
const X_CLIENT_ID = 'UXFXa2xWZXFkUVRvM1pYSWlrTkY6MTpjaQ'
// Hash-based redirect so the React SPA handles it client-side (no server needed)
const X_REDIRECT_URI = 'https://wenbrain.com/auth/callback'

function generateVerifier() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function startXLogin() {
  const verifier = generateVerifier()
  const challenge = await generateChallenge(verifier)
  const state = generateVerifier().slice(0, 16)

  sessionStorage.setItem('x_pkce_verifier', verifier)
  sessionStorage.setItem('x_pkce_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: X_CLIENT_ID,
    redirect_uri: X_REDIRECT_URI,
    scope: 'tweet.read users.read',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `https://twitter.com/i/oauth2/authorize?${params}`
}

// Called from the /auth/callback route with code + state parsed from the hash fragment
export async function handleXCallback(code, returnedState) {
  if (!code || !returnedState) return null

  const storedState = sessionStorage.getItem('x_pkce_state')
  const verifier = sessionStorage.getItem('x_pkce_verifier')

  if (returnedState !== storedState || !verifier) return null

  sessionStorage.removeItem('x_pkce_state')
  sessionStorage.removeItem('x_pkce_verifier')

  try {
    // SLEDGEHAMMER FIX: Hitting the absolute Netlify URL to bypass all routing rules
    const res = await fetch('https://tubular-dieffenbachia-b254bc.netlify.app/.netlify/functions/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        code_verifier: verifier,
        redirect_uri: X_REDIRECT_URI,
      }),
    })

    if (!res.ok) throw new Error(`Auth function error ${res.status}`)
    const user = await res.json()

    return {
      xId:         user.id,
      username:    user.username,
      displayName: user.name,
      avatarUrl:   user.profilePicture ?? null,
    }
  } catch (err) {
    console.error('[WenBrain] X OAuth failed:', err)
    return null
  }
}
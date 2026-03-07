// X OAuth 2.0 PKCE — public client (no secret needed)
// Replace X_CLIENT_ID with your actual X App Client ID
const X_CLIENT_ID = 'PASTE_YOUR_CLIENT_ID_HERE'
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

export async function handleXCallback() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const returnedState = params.get('state')

  if (!code || !returnedState) return null

  const storedState = sessionStorage.getItem('x_pkce_state')
  const verifier = sessionStorage.getItem('x_pkce_verifier')

  if (returnedState !== storedState || !verifier) return null

  sessionStorage.removeItem('x_pkce_state')
  sessionStorage.removeItem('x_pkce_verifier')

  try {
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: X_CLIENT_ID,
        redirect_uri: X_REDIRECT_URI,
        code_verifier: verifier,
      }),
    })
    if (!tokenRes.ok) throw new Error(`Token error ${tokenRes.status}`)
    const { access_token } = await tokenRes.json()

    const userRes = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    if (!userRes.ok) throw new Error(`User fetch error ${userRes.status}`)
    const { data } = await userRes.json()

    return {
      username: data.username,
      displayName: data.name,
      // Replace _normal with _bigger for a slightly larger avatar
      avatarUrl: data.profile_image_url?.replace('_normal', '_bigger') ?? null,
      accessToken: access_token,
    }
  } catch (err) {
    console.error('[WenBrain] X OAuth failed:', err)
    return null
  }
}

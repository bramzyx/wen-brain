// Netlify serverless function — X OAuth 2.0 token exchange
// Keeps client secret off the browser and avoids CORS restrictions.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://wenbrain.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { code, code_verifier, redirect_uri } = body

  if (!code || !code_verifier || !redirect_uri) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  const CLIENT_ID     = process.env.X_CLIENT_ID
  const CLIENT_SECRET = process.env.X_CLIENT_SECRET

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Server misconfigured' }) }
  }

  try {
    // Exchange code for access token (confidential client — Basic auth with secret)
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri,
        code_verifier,
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('[auth] Token exchange failed:', tokenRes.status, err)
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Token exchange failed', detail: err }) }
    }

    const { access_token } = await tokenRes.json()

    // Fetch user profile
    const userRes = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url',
      { headers: { Authorization: `Bearer ${access_token}` } }
    )

    if (!userRes.ok) {
      const err = await userRes.text()
      console.error('[auth] User fetch failed:', userRes.status, err)
      return { statusCode: 502, headers: CORS_HEADERS, body: JSON.stringify({ error: 'User fetch failed', detail: err }) }
    }

    const { data } = await userRes.json()

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        id:             data.id,
        username:       data.username,
        name:           data.name,
        profilePicture: data.profile_image_url?.replace('_normal', '_bigger') ?? null,
      }),
    }
  } catch (err) {
    console.error('[auth] Unexpected error:', err)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}

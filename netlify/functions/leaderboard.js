// Netlify serverless function — global leaderboard via Netlify Blobs
// GET  → returns top 50 players sorted by XP
// POST → upsert a player's score (X users only, keyed by id)

const { getStore } = require('@netlify/blobs')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    }
  }

  const store = getStore('leaderboard')

  // ── GET — return top 50 ───────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const { blobs } = await store.list()

      const players = await Promise.all(
        blobs.map(async (blob) => {
          try {
            return await store.get(blob.key, { type: 'json' })
          } catch {
            return null
          }
        })
      )

      const sorted = players
        .filter(Boolean)
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 50)

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(sorted),
      }
    } catch (err) {
      console.error('[leaderboard] GET error:', err)
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Failed to fetch leaderboard' }),
      }
    }
  }

  // ── POST — upsert player score ────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    let body
    try {
      body = JSON.parse(event.body)
    } catch {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
    }

    const { id, username, profilePicture, xp, levelsCompleted } = body

    if (!id || !username || typeof xp !== 'number') {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing required fields: id, username, xp' }) }
    }

    try {
      // Keep best XP — never overwrite a higher score
      let existing = null
      try {
        existing = await store.get(String(id), { type: 'json' })
      } catch {}

      const entry = {
        id: String(id),
        username,
        profilePicture: profilePicture || null,
        xp: existing ? Math.max(existing.xp, xp) : xp,
        levelsCompleted: levelsCompleted ?? 0,
        updatedAt: Date.now(),
      }

      await store.set(String(id), JSON.stringify(entry))

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(entry),
      }
    } catch (err) {
      console.error('[leaderboard] POST error:', err)
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Failed to save score' }),
      }
    }
  }

  return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) }
}

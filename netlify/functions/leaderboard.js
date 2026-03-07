const { getStore } = require('@netlify/blobs')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }

  try {
    const store = getStore('leaderboard')
    const SCORES_KEY = 'global-scores'

    if (event.httpMethod === 'GET') {
      let scores = await store.getJSON(SCORES_KEY) || []
      scores.sort((a, b) => b.xp - a.xp)
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(scores) }
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body)
      const { id, username, profilePicture, xp, levelsCompleted } = body

      if (!username || xp === undefined) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing fields' }) }
      }

      let scores = await store.getJSON(SCORES_KEY) || []
      const playerIndex = scores.findIndex(p => p.username === username)

      if (playerIndex >= 0) {
        if (xp > scores[playerIndex].xp) {
          scores[playerIndex].xp = xp
          scores[playerIndex].levelsCompleted = levelsCompleted
          scores[playerIndex].profilePicture = profilePicture || scores[playerIndex].profilePicture
        }
      } else {
        scores.push({ id, username, profilePicture, xp, levelsCompleted })
      }

      await store.setJSON(SCORES_KEY, scores)
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true }) }
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  } catch (error) {
    console.error('[Leaderboard] Blob error:', error)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: error.message }) }
  }
}

const { createClient } = require('@supabase/supabase-js');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);

      if (error) throw error;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(data),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { username, profile_picture, xp, levels_completed } = body;

      if (!username || xp === undefined) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Missing fields' }),
        };
      }

      const { data: existing } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', username)
        .single();

      if (existing) {
        if (xp > existing.xp) {
          await supabase
            .from('leaderboard')
            .update({ xp, levels_completed, profile_picture })
            .eq('username', username);
        }
      } else {
        await supabase
          .from('leaderboard')
          .insert([{ username, profile_picture, xp, levels_completed }]);
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  } catch (error) {
    console.error('[Leaderboard] Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

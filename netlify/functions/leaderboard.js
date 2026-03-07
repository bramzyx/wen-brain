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
      const levelsCompletedToSave = body.levels_completed || body.levelsCompleted || 0;
      const profilePicToSave = body.profile_picture || body.profilePicture || body.avatarUrl || null;
      const usernameToSave = body.username;
      const xp = body.xp;

      if (!usernameToSave || xp === undefined) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Missing fields' }),
        };
      }

      const { data: existing } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', usernameToSave)
        .single();

      if (existing) {
        if (xp > existing.xp) {
          await supabase
            .from('leaderboard')
            .update({ xp, levels_completed: levelsCompletedToSave, profile_picture: profilePicToSave })
            .eq('username', usernameToSave);
        }
      } else {
        await supabase
          .from('leaderboard')
          .insert([{ username: usernameToSave, profile_picture: profilePicToSave, xp, levels_completed: levelsCompletedToSave }]);
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


const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ')
      ? header.slice(7)
      : '';

    if (!token || !url || !key) {
      return res.status(401).json({
        error: 'Please sign in to continue.'
      });
    }

    const supabase = createClient(url, key, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: authData, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return res.status(401).json({
        error: 'Your session is invalid or expired.'
      });
    }

    // Fetch the profile using the correct UUID column
    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('id, college_id, full_name, role')
        .eq('id', authData.user.id)
        .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError);

      return res.status(500).json({
        error: 'Could not load your account profile.'
      });
    }

    if (!profile) {
      return res.status(403).json({
        error: 'Your account profile is not ready.'
      });
    }

    req.auth = {
      user: authData.user,
      profile,
      supabase
    };

    next();

  } catch (error) {
    next(error);
  }
}

function requireStudent(req, res, next) {
  if (!req.auth || req.auth.profile.role !== 'student') {
    return res.status(403).json({
      error: 'Student access only.'
    });
  }

  next();
}

module.exports = {
  requireUser,
  requireStudent
};

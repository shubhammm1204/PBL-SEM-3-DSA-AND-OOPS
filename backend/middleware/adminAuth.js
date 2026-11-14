const { requireUser } = require('./auth');

function requireAdmin(req, res, next) {
  requireUser(req, res, () => {
    if (req.auth.profile.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
    req.admin = { ...req.auth, supabase: req.auth.supabase };
    next();
  });
}
module.exports = { requireAdmin };

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    if (!allowedRoles.includes(req.user.role)) {
      if (req.user.role === 'admin') return res.redirect('/admin');
      if (req.user.role === 'coach') return res.redirect('/coach');
      if (req.user.role === 'player') return res.redirect('/player');
      return res.redirect('/login');
    }
    next();
  };
}

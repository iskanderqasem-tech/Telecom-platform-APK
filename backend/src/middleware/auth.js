const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

  try {
    req.user = jwt.verify(token, jwtConfig.secret);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

module.exports = auth;

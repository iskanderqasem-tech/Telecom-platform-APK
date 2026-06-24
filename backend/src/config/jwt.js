module.exports = {
  secret: process.env.JWT_SECRET || 'local-dev-secret',
  expiresIn: '12h'
};

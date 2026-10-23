const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'campusconnect_fallback_secret_for_dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn,
  });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'campusconnect_fallback_secret_for_dev';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};

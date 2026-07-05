const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

module.exports = { generateAccessToken, generateRefreshToken };

const ApiError = require('../utils/ApiError');

const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Admin only.');
  }
  next();
};

module.exports = admin;

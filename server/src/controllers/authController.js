const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
exports.register = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const user = await User.create({ firstName, lastName, email, password });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    user: user._id,
    token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      accessToken,
    },
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    user: user._id,
    token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });

  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      accessToken,
    },
  });
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
exports.refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw new ApiError(401, 'No refresh token provided');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const storedToken = await RefreshToken.findOne({ token: hashedToken });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    // Possible token reuse -- invalidate all tokens for this user
    if (storedToken) {
      await RefreshToken.deleteMany({ user: storedToken.user });
    }
    res.clearCookie('refreshToken');
    throw new ApiError(401, 'Invalid or expired refresh token. Please log in again.');
  }

  // Rotate: delete old, create new
  await RefreshToken.deleteOne({ _id: storedToken._id });

  const newRefreshToken = generateRefreshToken();
  await RefreshToken.create({
    user: storedToken.user,
    token: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });

  const user = await User.findById(storedToken.user);
  const accessToken = generateAccessToken(user._id, user.role);

  setRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success: true,
    data: { accessToken },
  });
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
exports.logout = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    await RefreshToken.deleteOne({ token: hashedToken });
  }
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // TODO: Send password reset email via emailService
  // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  res.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
exports.resetPassword = catchAsync(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Invalidate all refresh tokens for this user
  await RefreshToken.deleteMany({ user: user._id });

  res.json({ success: true, message: 'Password reset successful. Please log in.' });
});

const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get current user profile
// @route   GET /api/v1/users/me
exports.getMe = catchAsync(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc    Update current user profile
// @route   PUT /api/v1/users/me
exports.updateMe = catchAsync(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const updates = {};
  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (phone !== undefined) updates.phone = phone;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: user });
});

// @desc    Change password
// @route   PUT /api/v1/users/me/password
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  // Invalidate all other refresh tokens — force re-login on other devices
  const RefreshToken = require('../models/RefreshToken');
  await RefreshToken.deleteMany({ user: user._id });

  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Add a shipping address
// @route   POST /api/v1/users/me/addresses
exports.addAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { label, street, city, state, zipCode, country, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push({ label, street, city, state, zipCode, country, isDefault });
  await user.save();

  res.status(201).json({ success: true, data: user.addresses });
});

// @desc    Update a shipping address
// @route   PUT /api/v1/users/me/addresses/:addressId
exports.updateAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, req.body);
  await user.save();

  res.json({ success: true, data: user.addresses });
});

// @desc    Delete a shipping address
// @route   DELETE /api/v1/users/me/addresses/:addressId
exports.deleteAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  address.deleteOne();
  await user.save();

  res.json({ success: true, data: user.addresses });
});

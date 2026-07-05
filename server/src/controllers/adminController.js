const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/dashboard
exports.getDashboard = catchAsync(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    ordersByStatus,
    newCustomersThisWeek,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Order.aggregate([
      { $match: { 'payment.status': 'completed', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Order.aggregate([
      { $match: { 'payment.status': 'completed', createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Order.aggregate([
      { $match: { 'payment.status': 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments({ role: 'customer', createdAt: { $gte: startOfWeek } }),
    Product.find({
      isActive: true,
      'inventory.trackInventory': true,
      $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] },
    })
      .select('name inventory.quantity inventory.lowStockThreshold')
      .limit(10),
    Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'firstName lastName email'),
  ]);

  res.json({
    success: true,
    data: {
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        thisWeek: weekRevenue[0]?.total || 0,
        thisMonth: monthRevenue[0]?.total || 0,
      },
      ordersByStatus: ordersByStatus.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      newCustomersThisWeek,
      lowStockProducts,
      recentOrders,
    },
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/v1/admin/orders
exports.getAllOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = {};
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/v1/admin/orders/:id/status
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { status, note, trackingNumber, carrier } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.status = status;
  order.statusHistory.push({ status, note });
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;

  await order.save();

  // TODO: Send email notification on status change

  res.json({ success: true, data: order });
});

// @desc    Get low stock inventory
// @route   GET /api/v1/admin/inventory
exports.getLowStock = catchAsync(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    'inventory.trackInventory': true,
  })
    .select('name slug inventory images')
    .sort('inventory.quantity');

  res.json({ success: true, data: products });
});

// @desc    Get customer list
// @route   GET /api/v1/admin/customers
exports.getCustomers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [customers, total] = await Promise.all([
    User.aggregate([
      { $match: { role: 'customer' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          createdAt: 1,
          orderCount: { $size: '$orders' },
          totalSpent: { $sum: '$orders.pricing.total' },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]),
    User.countDocuments({ role: 'customer' }),
  ]);

  res.json({
    success: true,
    data: customers,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get all reviews for moderation
// @route   GET /api/v1/admin/reviews
exports.getReviewsForModeration = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate('user', 'firstName lastName')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments(),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Approve/reject a review
// @route   PUT /api/v1/admin/reviews/:id/approve
exports.moderateReview = catchAsync(async (req, res) => {
  const { isApproved } = req.body;

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved },
    { new: true }
  );

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  res.json({ success: true, data: review });
});

// @desc    List all users (Admin) — with role + counts
// @route   GET /api/v1/admin/users
exports.listAllUsers = catchAsync(async (req, res) => {
  const { search } = req.query;

  const filter = {};
  if (search) {
    const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ firstName: re }, { lastName: re }, { email: re }];
  }

  const users = await User.find(filter)
    .select('firstName lastName email role createdAt isEmailVerified')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: users });
});

// @desc    Update a user's role (Admin) — with safeguards
// @route   PUT /api/v1/admin/users/:id/role
exports.updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  const targetId = req.params.id;

  // Don't let an admin change their own role (prevents self-lockout)
  if (targetId === req.user._id.toString()) {
    throw new ApiError(
      400,
      'You cannot change your own role. Ask another admin to do it.'
    );
  }

  const target = await User.findById(targetId);
  if (!target) {
    throw new ApiError(404, 'User not found');
  }

  // If demoting an admin, ensure at least one admin remains
  if (target.role === 'admin' && role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw new ApiError(
        400,
        'Cannot demote the last remaining admin. Promote someone else first.'
      );
    }
  }

  target.role = role;
  await target.save();

  res.json({
    success: true,
    data: target.toJSON(),
    message:
      role === 'admin'
        ? `${target.firstName} is now an admin.`
        : `${target.firstName} is now a customer.`,
  });
});

// @desc    Get revenue data for charts
// @route   GET /api/v1/admin/revenue
exports.getRevenue = catchAsync(async (req, res) => {
  const { period = 'daily' } = req.query;
  const daysBack = period === 'monthly' ? 365 : period === 'weekly' ? 90 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  let groupBy;
  if (period === 'monthly') {
    groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
  } else if (period === 'weekly') {
    groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
  } else {
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
    };
  }

  const revenue = await Order.aggregate([
    { $match: { 'payment.status': 'completed', createdAt: { $gte: startDate } } },
    { $group: { _id: groupBy, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
  ]);

  res.json({ success: true, data: revenue });
});

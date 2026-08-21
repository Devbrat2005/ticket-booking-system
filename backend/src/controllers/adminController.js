const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['CUSTOMER', 'ORGANISER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (error) {
    next(error);
  }
};

const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalOrganisers = await User.countDocuments({ role: 'ORGANISER' });
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });

    const totalVenues = await Venue.countDocuments();
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'ACTIVE' });

    const bookingAggregate = await Booking.aggregate([
      { $match: { status: 'CONFIRMED' } },
      {
        $group: {
          _id: null,
          totalSystemRevenue: { $sum: '$totalAmount' },
          totalBookingsCount: { $sum: 1 },
          totalTicketsSold: { $sum: { $size: '$seats' } },
        },
      },
    ]);

    const metrics = bookingAggregate.length > 0 ? bookingAggregate[0] : { totalSystemRevenue: 0, totalBookingsCount: 0, totalTicketsSold: 0 };

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, customers: totalCustomers, organisers: totalOrganisers, admins: totalAdmins },
        venues: { total: totalVenues },
        events: { total: totalEvents, active: activeEvents },
        bookings: metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  getSystemStats,
};

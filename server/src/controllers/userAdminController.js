const User = require("../models/User.model");

module.exports = {
  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      const safeUsers = users.map(user => user.toSafeObject());
      res.status(200).json({ success: true, count: safeUsers.length, data: safeUsers });
    } catch (err) {
      next(err);
    }
  },
  toggleUserActive: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }
      
      // Toggle block status
      user.isBlocked = !user.isBlocked;
      await user.save();

      res.status(200).json({
        success: true,
        message: `User status changed to ${user.isBlocked ? "blocked" : "active"}`,
        data: user.toSafeObject(),
      });
    } catch (error) {
      next(error);
    }
  },
};

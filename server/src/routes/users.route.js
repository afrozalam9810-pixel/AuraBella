const express = require("express");
const { getAllUsers, toggleUserActive } = require("../controllers/userAdminController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

// Apply protection and admin check to all admin user routes
router.use(protect);
router.use(adminOnly);

router.route("/")
  .get(getAllUsers);

router.route("/:id/toggle-active")
  .put(toggleUserActive);

module.exports = router;

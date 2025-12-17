const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markNotificationRead,
  sendStartDateReminders,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.get("/start-date-reminder", sendStartDateReminders);
router.put("/:id/read", protect, markNotificationRead);

module.exports = router;

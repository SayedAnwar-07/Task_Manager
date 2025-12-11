const express = require("express");
const router = express.Router();
const Notified = require("../models/Notified");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notified.find({ users: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const fixed = notifications.map((n) => ({
      ...n,
      readBy: n.readBy || [],
    }));

    res.json(fixed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notified.findById(req.params.id);

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    const allowed = notification.users.some(
      (u) => u.toString() === req.user._id.toString()
    );
    if (!allowed) return res.status(403).json({ message: "Not authorized" });

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
    }

    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

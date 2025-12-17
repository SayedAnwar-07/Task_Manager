const Notified = require("../models/Notified");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notified.find({
      users: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const fixedNotifications = notifications.map((n) => ({
      ...n,
      readBy: n.readBy || [],
    }));

    res.json(fixedNotifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notified.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const isAllowed = notification.users.some(
      (u) => u.toString() === req.user._id.toString()
    );

    if (!isAllowed) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
    }

    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reminder Controller
const sendStartDateReminders = async (req, res) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      startDate: { $gte: now, $lte: next24Hours },
      startReminderSent: false,
    }).populate("createdBy");

    for (const task of tasks) {
      await Notified.create({
        users: [task.createdBy._id],
        message: `⏰ Reminder: Your task "${task.title}" will start in 24 hours.`,
        type: "task",
        link: `/tasks/${task._id}`,
      });

      task.startReminderSent = true;
      await task.save();
    }

    res.json({
      success: true,
      notifiedTasks: tasks.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reminder job failed" });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  sendStartDateReminders,
};

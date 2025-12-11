const Notified = require("../models/Notified");

const createNotification = async ({
  userIds,
  message,
  type = "task",
  link,
}) => {
  if (!userIds || userIds.length === 0) return;

  return await Notified.create({
    users: userIds,
    message,
    type,
    link,
    readBy: [],
  });
};

module.exports = { createNotification };

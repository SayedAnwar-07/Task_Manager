const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    message: { type: String, required: true },
    type: { type: String, enum: ["task", "work"], default: "task" },
    link: { type: String },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notified", notificationSchema);

const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    timeRange: { type: String },
    shareUrl: { type: String },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Work = mongoose.model("Work", workSchema);
module.exports = Work;

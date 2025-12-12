const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    display_image: {
      type: String,
      default:
        "https://www.pitsstop.in/cdn/shop/files/GOKU_WALL_ART.jpg?v=1763233413&width=1946",
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["owner", "co_owner", "project_manager"],
      default: "project_manager",
    },
  },
  { timestamps: true }
);

// Pre-save password hashing (only hashes once)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

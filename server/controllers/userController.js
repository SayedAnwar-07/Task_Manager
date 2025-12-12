const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { cloudinary, streamUpload } = require("../config/cloudinary");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    const allowedRoles = ["owner", "co_owner", "project_manager"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Handle display image
    let display_image = null;
    if (req.file) {
      const result = await streamUpload(req.file.buffer, "users");
      display_image = result.secure_url;
    }

    const user = await User.create({
      name,
      email,
      password,
      display_image,
      role: role || "project_manager",
    });

    res.status(201).json({
      _id: user._id,
      display_image: user.display_image,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please provide email and password" });

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        display_image: user.display_image,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get all users
// @route GET /api/users
// @access Private
const getUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "project_manager") {
      // Only project_manager users
      users = await User.find({ role: "project_manager" }).select("-password");
    } else {
      // owner or co_owner → all users
      users = await User.find().select("-password");
    }

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get single user
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    return res
      .status(403)
      .json({ message: "You can view only your own profile" });
  }

  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

// @desc Update user (self)
// @route PUT /api/users/:id
// @access Private
const updateUser = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "You can update only your profile" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle file upload
    if (req.file) {
      const result = await streamUpload(req.file.buffer, "users");
      user.display_image = result.secure_url;
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      display_image: updatedUser.display_image,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Delete user (self)
// @route DELETE /api/users/:id
// @access Private
const deleteUser = async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    return res
      .status(403)
      .json({ message: "You can delete only your profile" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.deleteOne();
  res.json({ message: "User removed" });
};

module.exports = {
  registerUser,
  authUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};

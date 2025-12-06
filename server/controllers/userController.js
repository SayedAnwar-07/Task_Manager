const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc Get all users
// @route GET /api/users
// @access Private
const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
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
  if (req.user._id.toString() !== req.params.id) {
    return res
      .status(403)
      .json({ message: "You can update only your profile" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
  });
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

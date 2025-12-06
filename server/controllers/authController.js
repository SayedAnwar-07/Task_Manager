import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import cloudinary from "../config/cloudinary.js";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });

    let image = "";
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      image = upload.secure_url;
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      profile_image: image,
    });

    res.json({
      _id: user._id,
      fullName,
      email,
      role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid Credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PROFILE
export const getProfile = async (req, res) => {
  res.json(req.user);
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;

    if (req.body.password) user.password = req.body.password;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      user.profile_image = upload.secure_url;
    }

    const updated = await user.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

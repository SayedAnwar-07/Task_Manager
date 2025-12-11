const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");

router.get("/", protect, getUsers);
router
  .route("/:id")
  .get(protect, getUserById)
  .put(protect, upload.single("display_image"), updateUser)
  .delete(protect, deleteUser);

module.exports = router;

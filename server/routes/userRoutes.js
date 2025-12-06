const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", protect, getUsers);
router
  .route("/:id")
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;

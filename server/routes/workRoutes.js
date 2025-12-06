const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  createWork,
  getWorksByTask,
  getWorkById,
  updateWork,
  deleteWork,
} = require("../controllers/workController");

const upload = multer({ storage: multer.memoryStorage() });

// Works under a task
router
  .route("/tasks/:taskId/works")
  .post(protect, upload.array("images", 10), createWork) 
  .get(protect, getWorksByTask);

// Individual work
router
  .route("/works/:id")
  .get(protect, getWorkById)
  .put(protect, upload.array("images", 10), updateWork)
  .delete(protect, deleteWork);

module.exports = router;

const express = require("express");
const router = express.Router();
const { registerUser, authUser } = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", upload.single("display_image"), registerUser);
router.post("/login", authUser);

module.exports = router;

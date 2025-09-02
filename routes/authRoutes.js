const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/register", register);
router.post("/login", login);

// Private
router.get("/me", protect, getMe);

module.exports = router;
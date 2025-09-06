const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateLocation,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);


router.get("/profile", protect, getProfile);
router.put("/location", protect, updateLocation);

module.exports = router;

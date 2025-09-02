const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateAvailability,
  updateLocation,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);


router.get("/profile", protect, getProfile);
router.put("/availability", protect, updateAvailability); // drivers toggle online/offline
router.put("/location", protect, updateLocation); // update live location

module.exports = router;

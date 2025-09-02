const express = require("express");
const router = express.Router();
const {
  requestRide,
  getMyRides,
  acceptRide,
  completeRide,
  cancelRide,
} = require("../controllers/rideController");
const { protect } = require("../middleware/authMiddleware");

// Rider requests a ride
router.post("/request", protect, requestRide);

// Rider or driver can see their rides
router.get("/myrides", protect, getMyRides);

// Driver actions
router.put("/:id/accept", protect, acceptRide);
router.put("/:id/complete", protect, completeRide);

// Rider cancels ride
router.put("/:id/cancel", protect, cancelRide);

module.exports = router;

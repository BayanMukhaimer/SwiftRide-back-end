const express = require("express");
const router = express.Router();
const {
  requestRide,
  getMyRides,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  getRideById,
} = require("../controllers/rideController");
const { protect } = require("../middleware/authMiddleware");
router.get("/myrides", protect, getMyRides);

// Rider requests a ride
router.post("/request", protect, requestRide);

// Rider or driver can see their rides
router.get("/:id", protect, getRideById);
// Driver actions
router.put("/:id/accept", protect, acceptRide);
router.put("/:id/start", protect, startRide);
router.put("/:id/complete", protect, completeRide);

// Rider cancels ride
router.delete("/:id/cancel", protect, cancelRide);

module.exports = router;

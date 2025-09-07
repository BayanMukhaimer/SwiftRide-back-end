const Ride = require("../models/Ride");
const User = require("../models/User");


const PRICING = {
  "4-seater": { base: 2, perKm: 0.5, perMin: 0.2 },
  "6-seater": { base: 3, perKm: 0.8, perMin: 0.3 },
};

const requestRide = async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "Only riders can request rides" });
    }

    const { pickup, dropoff, distanceKm, durationMin, vehicle } = req.body;

    if (!pickup || !dropoff || !vehicle) {
      return res
        .status(400)
        .json({ message: "Pickup, dropoff, and vehicle type are required" });
    }

    if (!PRICING[vehicle]) {
      return res.status(400).json({ message: "Invalid vehicle type" });
    }


    const rates = PRICING[vehicle];
    const fare =
      rates.base +
      (Number(distanceKm) || 0) * rates.perKm +
      (Number(durationMin) || 0) * rates.perMin;

    const ride = await Ride.create({
      rider: req.user._id,
      pickup,
      dropoff,
      vehicle,
      distanceKm,
      durationMin,
      fare,
      status: "requested",
    });

    const populated = await ride.populate("rider", "name email");


    const io = req.app.get("io");
    io.emit("newRide", populated);

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const getMyRides = async (req, res) => {
  const filter =
    req.user.role === "rider"
      ? { rider: req.user._id }
      : { driver: req.user._id };

  const rides = await Ride.find(filter)
    .populate("rider", "name email")
    .populate("driver", "name email vehicle");

  res.json(rides);
};


const acceptRide = async (req, res) => {
  console.log("acceptRide user:", {
    id: req.user?._id?.toString(),
    role: req.user?.role,
    email: req.user?.email,
  });
  const foundUser = await User.findById(req.user.id)

  console.log(foundUser)
  if (foundUser.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can accept rides" });
  }

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (ride.status !== "requested") {
    return res.status(400).json({ message: "Ride is not available to accept" });
  }

  ride.driver = req.user._id;
  ride.status = "accepted";
  await ride.save();

  res.json({ message: "Ride accepted", ride });
};

const startRide = async (req, res) => {
  if (req.user.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can start rides" });
  }

  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ message: "Ride not found" });

  if (ride.status !== "accepted") {
    return res.status(400).json({ message: "Only accepted rides can be started" });
  }

  ride.status = "in-progress";
  ride.startedAt = new Date();
  await ride.save();

  res.json({ message: "Ride started", ride });
};

const completeRide = async (req, res) => {
  if (req.user.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can complete rides" });
  }

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (ride.status !== "accepted" && ride.status !== "in-progress") {
    return res.status(400).json({ message: "Ride cannot be completed" });
  }

  ride.status = "completed";
  await ride.save();

  res.json({ message: "Ride completed", ride });
};


const cancelRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  console.log("Cancel attempt:", {
    rideId: ride._id.toString(),
    status: ride.status,
    rider: ride.rider?.toString(),
    requester: req.user?._id?.toString(),
  });

  if (ride.rider.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only cancel your own rides" });
  }

  if (ride.status !== "requested") {
    return res.status(400).json({ message: "Only requested rides can be cancelled" });
  }

  ride.status = "cancelled";
  await ride.save();

  res.json({ message: "Ride cancelled", ride });
};


const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("rider", "name email")
      .populate("driver", "name email vehicle");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestRide,
  getMyRides,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  getRideById
};

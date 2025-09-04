const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

 
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, vehicle } = req.body;

    
    const vehicleData = role === "driver" ? vehicle : null;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      vehicle: vehicleData,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vehicle: user.vehicle,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

 
// changing it to email
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vehicle: user.role === "driver" ? user.vehicle : undefined,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid name or password" });
  }
};

 
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  
  if (user.role !== "driver") {
    user.vehicle = undefined;
  }

  res.json(user);
};


const updateLocation = async (req, res) => {
  const { lat, lng } = req.body;

  req.user.location = { lat, lng };
  await req.user.save();

  res.json({ message: "Location updated", location: req.user.location });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateLocation,
};

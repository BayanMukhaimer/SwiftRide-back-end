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
    res.status(401).json({ message: "Invalid email or password" });
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



const updateAvailability = async (req, res) => {
  if (req.user.role !== "driver") {
    return res.status(403).json({ message: "Only drivers can update availability" });
  }

  req.user.isAvailable = req.body.isAvailable;
  await req.user.save();

  res.json({ message: "Availability updated", isAvailable: req.user.isAvailable });
};



module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateAvailability,
  
};

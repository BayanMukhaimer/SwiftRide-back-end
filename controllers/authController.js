const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};



const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, vehicle } = req.body;

    
    const userExists = await User.findOne({ name });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

   
    const vehicleData = role === "driver" ? vehicle : null;

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
    console.error(error); 
    res.status(500).json({ message: "Server error" });
  }
};




const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid name or password" });
  }


  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid name or password" });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    vehicle: user.role === "driver" ? user.vehicle : undefined,
    token: generateToken(user._id),
  });
};


const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };

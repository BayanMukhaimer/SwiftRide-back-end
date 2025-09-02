const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};



const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, vehicle } = req.body;

    
    const userExists = await User.findOne({ email });
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




module.exports = { register };

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["rider", "driver"]
    },

    phone: String,
    vehicle: {
        type: String
    },

    location: {
        lat: Number,
        lng: Number
    },

    isAvailable: {
        type: Boolean,
        default: false
    }

})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = model("User", userSchema);
module.exports =User
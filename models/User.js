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


const User = model("User", userSchema);
module.exports =User
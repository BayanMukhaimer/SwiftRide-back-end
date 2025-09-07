const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const rideSchema = new Schema(
  {
    rider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    pickup: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    dropoff: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["requested", "accepted", "in-progress", "completed", "cancelled"],
      default: "requested",
    },
    distanceKm: Number,
    durationMin: Number,
    fare: Number,
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    vehicle: {
      type: String,
      enum: ["4-seater", "4-seater"]
    }
  },
  { timestamps: true }
);

const Ride = model("Ride", rideSchema);
module.exports = Ride;

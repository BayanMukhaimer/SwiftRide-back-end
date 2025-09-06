const express = require("express");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const methodOverride = require("method-override");
const http = require("http");
const { Server } = require("socket.io");
const connectToDB = require("./config/db");

const cors = require("cors")


const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: { origin: "*" }
});



app.use(express.static("public")); 
app.use(express.urlencoded({ extended: false })); 
app.use(express.json()); 
app.use(methodOverride("_method")); 
app.use(morgan("dev"));
app.use(cors())


connectToDB();



const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");

app.set("io", io);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);



let riders = {};
let drivers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  
  
  socket.on("register", ({ userId, role }) => {
    if (role === "rider") riders[userId] = socket.id;
    if (role === "driver") drivers[userId] = { socketId: socket.id, isAvailable: true };
    console.log(`${role} registered: ${userId}`);
  });

  
  
  // socket.on("driverAvailability", ({ driverId, isAvailable }) => {
  //   if (drivers[driverId]) {
  //     drivers[driverId].isAvailable = isAvailable;
  //     console.log(`Driver ${driverId} is now ${isAvailable ? "online" : "offline"}`);
  //   }
  // });

 
  
  socket.on("rideRequest", (data) => {
    console.log("Ride requested:", data);
    Object.entries(drivers).forEach(([driverId, info]) => {
      if (info.isAvailable) {
        io.to(info.socketId).emit("newRide", data);
      }
    });
  });


  
  socket.on("acceptRide", (data) => {
    console.log("Ride accepted:", data);
    const riderSocket = riders[data.riderId];
    if (riderSocket) io.to(riderSocket).emit("rideAccepted", data);

    if (drivers[data.driverId]) drivers[data.driverId].isAvailable = false;
  });

  
  socket.on("endRide", (data) => {
    console.log("Ride ended:", data);

    const riderSocket = riders[data.riderId];
    const driverInfo = drivers[data.driverId];

    if (riderSocket) io.to(riderSocket).emit("rideEnded", data);
    if (driverInfo) io.to(driverInfo.socketId).emit("rideEnded", data);

    if (driverInfo) drivers[data.driverId].isAvailable = true;
  });


  
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    Object.keys(riders).forEach((id) => {
      if (riders[id] === socket.id) delete riders[id];
    });

    Object.keys(drivers).forEach((id) => {
      if (drivers[id].socketId === socket.id) delete drivers[id];
    });
  });
});



const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

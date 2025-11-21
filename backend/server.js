const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

dotenv.config();

const setupWebSocket = require("./websocket");
const historyRoutes = require("./routes/historyRoutes");
const controlRoutesFactory = require("./routes/controlRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint to verify Render deployment
app.get("/", (req, res) => {
  res.send("🚀 Toxic Gas Backend API is running on Render!");
});

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// HTTP + WebSocket server
const server = http.createServer(app);
const { broadcastToESP } = setupWebSocket(server);

// Routes
app.use("/api/history", historyRoutes);
app.use("/api/control", controlRoutesFactory(broadcastToESP));

// Render uses dynamic PORT
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket available at ws://<your-domain>/ws`);
});

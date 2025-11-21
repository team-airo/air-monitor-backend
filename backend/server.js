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

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Toxic Gas Backend API is running");
});

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Create HTTP server
    const server = http.createServer(app);

    // Prevent Render WS timeouts
    server.keepAliveTimeout = 60000;
    server.headersTimeout = 65000;

    // Setup WebSocket
    const { broadcastToESP } = setupWebSocket(server);

    // Register routes
    app.use("/api/history", historyRoutes);
    app.use("/api/control", controlRoutesFactory(broadcastToESP));

    // Start listening
    server.listen(PORT, () => {
      const wsURL = process.env.RENDER_EXTERNAL_HOSTNAME
        ? `wss://${process.env.RENDER_EXTERNAL_HOSTNAME}/ws`
        : `ws://localhost:${PORT}/ws`;

      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket running at: ${wsURL}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

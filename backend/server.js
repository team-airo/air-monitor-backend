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

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Toxic Gas Backend API is running");
});

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const server = http.createServer(app);
    server.keepAliveTimeout = 60000;
    server.headersTimeout = 65000;

    const { broadcastToESP } = setupWebSocket(server);

    app.use("/api/history", historyRoutes);
    app.use("/api/control", controlRoutesFactory(broadcastToESP));

    server.listen(PORT, () => {
      const wsURL = process.env.RENDER_EXTERNAL_HOSTNAME
        ? `wss://${process.env.RENDER_EXTERNAL_HOSTNAME}/ws`
        : `ws://localhost:${PORT}/ws`;

      console.log(`Server on port ${PORT}`);
      console.log(`WebSocket at ${wsURL}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
}

startServer();

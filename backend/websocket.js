const WebSocket = require("ws");
const SensorData = require("./models/SensorData");

const clients = new Set();

function broadcastToESP(data) {
  const msg = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket: client connected");

    // Confirm connection
    ws.send(JSON.stringify({ message: "WS connection established" }));
    clients.add(ws);

    ws.on("message", async (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        console.log("WebSocket: invalid JSON received");
        return;
      }

      // Save sensor data to DB
      if (data.type === "sensor_data") {
        try {
          await SensorData.create(data);
        } catch (err) {
          console.error("WebSocket: DB save error:", err);
        }
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("WebSocket: client disconnected");
    });
  });

  return { broadcastToESP };
}

module.exports = setupWebSocket;

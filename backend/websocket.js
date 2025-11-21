const WebSocket = require("ws");
const SensorData = require("./models/SensorData");

let clients = new Set();

function broadcastToESP(data) {
  const msg = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("ESP32 connected");
    clients.add(ws);

    ws.on("message", async (message) => {
      try {
        const json = JSON.parse(message.toString());

        if (json.type === "sensor_data") {
          await SensorData.create(json);
          console.log("Saved sensor data.");
        }
      } catch (err) {
        console.log("WS Error:", err);
      }
    });

    ws.on("close", () => clients.delete(ws));
  });

  return { broadcastToESP };
}

module.exports = setupWebSocket;

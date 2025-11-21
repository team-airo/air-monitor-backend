const WebSocket = require("ws");
const SensorData = require("./models/SensorData");

const clients = new Set();

function broadcastToESP(data) {
  const msg = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(msg);
      } catch (err) {
        console.error("WS send error:", err);
      }
    }
  });
}

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WS: client connected");

    ws.send(JSON.stringify({ message: "WS connection established" }));
    clients.add(ws);

    ws.on("message", async (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        console.log("WS: invalid JSON");
        return;
      }

      if (data.type === "sensor_data") {
        try {
          await SensorData.create({
            mq135: data.mq135,
            mq7: data.mq7,
            mq2: data.mq2,
            danger: data.danger,
            fan: data.fan,
            buzzer: data.buzzer,
          });
        } catch (e) {
          console.error("Error saving sensor data:", e);
        }
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("WS: client disconnected");
    });
  });

  return { broadcastToESP };
}

module.exports = setupWebSocket;

// websocket.js
const WebSocket = require("ws");
const SensorData = require("./models/SensorData");

const clients = new Set();
let isEspConnected = false; // Track ESP status globally

function broadcastToClients(data) {
  const msg = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WS: New Client connected");
    clients.add(ws);

    // 1. Immediately tell the NEW client if ESP is currently connected
    ws.send(
      JSON.stringify({
        type: "esp_status",
        status: isEspConnected ? "ONLINE" : "OFFLINE",
      }),
    );

    ws.on("message", async (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }

      // 2. Identify ESP32: If we receive sensor data, we know this socket is the ESP
      if (data.type === "sensor_data") {
        // Mark this specific socket as the ESP device
        ws.isEspDevice = true;

        // If state changed to online, broadcast it
        if (!isEspConnected) {
          isEspConnected = true;
          broadcastToClients({ type: "esp_status", status: "ONLINE" });
          console.log("Device identified: ESP32 is ONLINE");
        }

        // Save to DB FIRST to get the timestamp
        let savedRecord;
        try {
          savedRecord = await SensorData.create({
            mq135: data.mq135,
            mq7: data.mq7,
            mq2: data.mq2,
            danger: data.danger,
            fan: data.fan,
            buzzer: data.buzzer,
          });
          console.log(
            "Data saved to DB with timestamp:",
            savedRecord.timestamp,
          );
        } catch (e) {
          console.error("DB Save Error:", e);
        }

        // Broadcast sensor data WITH the database timestamp to prevent duplicates
        broadcastToClients({
          ...data,
          timestamp: savedRecord ? savedRecord.timestamp : new Date(),
        });
      }

      // Optional: Explicit registration from ESP32 (if you add this to C++ code)
      if (data.type === "register_esp") {
        ws.isEspDevice = true;
        isEspConnected = true;
        broadcastToClients({ type: "esp_status", status: "ONLINE" });
      }
    });

    ws.on("close", () => {
      clients.delete(ws);

      // 3. If the socket that closed was the ESP, update status
      if (ws.isEspDevice) {
        console.log("Device disconnected: ESP32 is OFFLINE");
        isEspConnected = false;
        broadcastToClients({ type: "esp_status", status: "OFFLINE" });
      }
    });
  });

  return { broadcastToESP: broadcastToClients };
}

module.exports = setupWebSocket;

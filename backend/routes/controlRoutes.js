const express = require("express");
const ControlState = require("../models/ControlState");

module.exports = (broadcastToESP) => {
  const router = express.Router();

  router.post("/fan", async (req, res) => {
    const state = req.body.state === "ON" ? "ON" : "OFF";

    broadcastToESP({ fan: state });

    const updated = await ControlState.findOneAndUpdate(
      {},
      { fan: state, updatedAt: new Date() },
      { upsert: true, new: true },
    );

    res.json({ success: true, control: updated });
  });

  router.post("/buzzer", async (req, res) => {
    const state = req.body.state === "ON" ? "ON" : "OFF";

    broadcastToESP({ buzzer: state });

    const updated = await ControlState.findOneAndUpdate(
      {},
      { buzzer: state, updatedAt: new Date() },
      { upsert: true, new: true },
    );

    res.json({ success: true, control: updated });
  });

  router.get("/", async (req, res) => {
    const status = (await ControlState.findOne()) || {
      fan: "OFF",
      buzzer: "OFF",
    };
    res.json(status);
  });

  return router;
};

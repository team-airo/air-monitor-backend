const express = require("express");
const router = express.Router();

module.exports = (broadcastToESP) => {
  router.post("/fan", (req, res) => {
    broadcastToESP({ fan: req.body.state });
    res.json({ success: true });
  });

  router.post("/buzzer", (req, res) => {
    broadcastToESP({ buzzer: req.body.state });
    res.json({ success: true });
  });

  return router;
};

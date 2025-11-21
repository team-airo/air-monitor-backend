const express = require("express");
const router = express.Router();

module.exports = (broadcastToESP) => {
  router.post("/fan", (req, res) => {
    // console.log(`POST /api/control/fan - state: ${req.body.state}`);
    broadcastToESP({ fan: req.body.state });
    res.json({ success: true });
  });

  router.post("/buzzer", (req, res) => {
    // console.log(`POST /api/control/buzzer - state: ${req.body.state}`);
    broadcastToESP({ buzzer: req.body.state });
    res.json({ success: true });
  });

  return router;
};

const express = require("express");
const SensorData = require("../models/SensorData");
const router = express.Router();

router.get("/latest", async (req, res) => {
  // console.log("GET /api/history/latest");
  const latest = await SensorData.findOne().sort({ timestamp: -1 });
  res.json(latest || {});
});

router.get("/recent", async (req, res) => {
  const limit = Number(req.query.limit) || 200;
  // console.log(`GET /api/history/recent?limit=${limit}`);
  const data = await SensorData.find().sort({ timestamp: -1 }).limit(limit);
  res.json(data);
});

module.exports = router;

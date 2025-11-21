const express = require("express");
const SensorData = require("../models/SensorData");
const router = express.Router();

router.get("/latest", async (req, res) => {
  const latest = await SensorData.findOne().sort({ timestamp: -1 }).lean();
  res.json(latest || {});
});

router.get("/recent", async (req, res) => {
  const limit = Math.min(500, Number(req.query.limit) || 200);
  const data = await SensorData.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
  res.json(data);
});

module.exports = router;

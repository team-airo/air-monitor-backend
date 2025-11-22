// routes/historyRoutes.js
const express = require("express");
const router = express.Router();
const SensorData = require("../models/SensorData");

router.get("/", async (req, res) => {
  try {
    // 1. Get last 10 records, sorted by newest first
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(10);

    // 2. Reverse them so the chart reads Left(Old) -> Right(New)
    res.json(data.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

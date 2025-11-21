const mongoose = require("mongoose");

const SensorDataSchema = new mongoose.Schema({
  mq135: Number,
  mq7: Number,
  mq2: Number,
  danger: Boolean,
  fan: String,
  buzzer: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SensorData", SensorDataSchema);

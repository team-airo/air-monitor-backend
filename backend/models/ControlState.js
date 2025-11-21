const mongoose = require("mongoose");

const ControlStateSchema = new mongoose.Schema({
  fan: { type: String, default: "OFF" },
  buzzer: { type: String, default: "OFF" },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ControlState", ControlStateSchema);

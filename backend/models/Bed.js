const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  state: { type: String, required: true, enum: ["available", "occupied", "maintenance"], default: "available" },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }, // Assuming a Room model
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Assuming User model with role 'patient'
}, { timestamps: true });

const Bed = mongoose.model("Bed", bedSchema);

module.exports = Bed;

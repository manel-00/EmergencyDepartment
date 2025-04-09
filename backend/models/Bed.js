const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  number: { type: String, required: true },
  state: { type: String, required: true, enum: ["available", "occupied", "maintenance"], default: "available" },
  free: { type: Boolean, default: true } ,
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }, 
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
}, { timestamps: true });

const Bed = mongoose.model("Bed", bedSchema);

module.exports = Bed;

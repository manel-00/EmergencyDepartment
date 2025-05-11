const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  treatments: [
    {
      name: String,
      cost: Number,
    },
  ],
  daysSpent: { type: Number, default: 0 },
  extraCharges: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  tva: { type: Number, required: true },
  extraDetails: [String], // e.g., ["Repas spécial (30 TND)", "Suivi personnalisé (80 TND)"]
  description: { type: String, default: "" },
  totalCost: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["paid", "not paid"], default: "not paid" }, // Add status field
});

module.exports = mongoose.model("Bill", billSchema);

const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    creationDate: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    specialty: { type: mongoose.Schema.Types.ObjectId, ref: "Specialty" },
    image: { type: String, default: null },
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    faceToken: { type: String, unique: true, sparse: true },
    // Google Calendar integration fields
    googleCalendarEnabled: { type: Boolean, default: false },
    googleCalendarTokens: {
        access_token: { type: String },
        refresh_token: { type: String },
        scope: { type: String },
        token_type: { type: String },
        expiry_date: { type: Number }
    },
});

// Create User Model
const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: { type: String, required: true },
    type: { type: String, required: true },
    floor: { type: Number, required: true },
    state: { type: Number, required: true }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
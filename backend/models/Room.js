const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: { type: String, required: true },
    type: { type: String, required: true },
    floor: { type: Number, required: true },
    ward: { type: String, required: true },
    state: { type: String, default: 'available', }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
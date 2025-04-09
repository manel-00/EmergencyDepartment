const express = require('express');
const Room = require('../models/Room'); // Adjust the path if necessary

const router = express.Router();


// Route to get all rooms grouped by their floor
router.get('/byfloor', async (req, res) => {
    try {
        const rooms = await Room.find();
        
        // Group rooms by floor
        const roomsByFloor = rooms.reduce((acc, room) => {
            // Check if the floor exists, if not, create it
            if (!acc[room.floor]) {
                acc[room.floor] = [];
            }
            // Push the room to the correct floor
            acc[room.floor].push(room);
            return acc;
        }, {});

        // Return the rooms grouped by floor
        res.json(roomsByFloor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/', async (req, res) => {
    try {
        const newRoom = new Room(req.body);
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Room not found" });
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRoom) return res.status(404).json({ message: "Room not found" });
        res.json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        if (!deletedRoom) return res.status(404).json({ message: "Room not found" });
        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/byfloor', async (req, res) => {
    try {
        const rooms = await Room.find();
        
        // Group rooms by floor
        const roomsByFloor = rooms.reduce((acc, room) => {
            if (!acc[room.floor]) {
                acc[room.floor] = [];
            }
            acc[room.floor].push(room);
            return acc;
        }, {});

        res.json(roomsByFloor); // Return the grouped rooms by floor
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;

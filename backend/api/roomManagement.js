const express = require('express');
const Room = require('../models/Room'); 
const Bed = require("../models/Bed");
const router = express.Router();

// Fetch all beds in a specific room by roomId
router.get('/:roomId/beds', async (req, res) => {
    try {
      const { roomId } = req.params; // Get roomId from the URL
  
      // Check if the room exists
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
  
      // Fetch all beds associated with the given roomId
      const beds = await Bed.find({ room: roomId });
  
      // If no beds are found, return a message
      if (beds.length === 0) {
        return res.status(404).json({ message: "No beds found in this room" });
      }
  
      // Respond with the list of beds
      res.status(200).json(beds);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Create a new bed in an existing room
router.post('/:roomId/create-bed', async (req, res) => {
    try {
      const { roomId } = req.params; // Get roomId from URL
      const { number, state, patient } = req.body; // Get bed details from request body
  
      // Check if the room exists
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
  
      // Create a new bed and associate it with the room
      const newBed = new Bed({
        number,
        state,
        room: roomId, // Automatically associate the bed with the room
        patient: patient || null, // If patient is provided, set it, otherwise set to null
      });
  
      // Save the new bed to the database
      const savedBed = await newBed.save();
  
      // Respond with the created bed
      res.status(201).json(savedBed);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Create a new bed
router.post("/addbed", async (req, res) => {
  try {
    const newBed = new Bed(req.body);
    const savedBed = await newBed.save();
    res.status(201).json(savedBed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all beds with room and patient details
router.get("/getallbeds", async (req, res) => {
  try {
    const beds = await Bed.find().populate("room").populate({
      path: "patient",
      match: { role: "patient" } // Ensures only users with role 'patient' are populated
    });
    res.status(200).json(beds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get all rooms (with optional filters)
router.get("/query", async (req, res) => {
    const { floor, ward } = req.query;
    let query = {};
  
    if (floor) query.floor = floor;
    if (ward) query.ward = new RegExp(ward, "i");
  
    try {
      const rooms = await Room.find(query);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });


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

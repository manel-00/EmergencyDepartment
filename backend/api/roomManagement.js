const express = require('express');
const Room = require('../models/Room'); 
const Bed = require("../models/Bed");
const User = require('../models/User'); 

const router = express.Router();

const { Parser } = require('json2csv');

// GET /api/beds/export - Export all beds as CSV
router.get('/export', async (req, res) => {
  try {
    // Fetch all beds and populate the room field
    const beds = await Bed.find()
      .populate({
        path: 'room',  // Populate room field in the bed
        select: 'number state floor ward'  // Select necessary room fields
      });

    // Map the data to the CSV format
    const formattedData = beds.map(bed => ({
      'Room Number': bed.room?.number || 'N/A', // Fallback to 'N/A' if no room
      'Bed Number': bed.number,
      'Bed State': bed.state === 'available' ? 'Available' : 'Occupied', // Consistent casing
    }));

    const fields = ['Room Number', 'Bed Number', 'Bed State'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedData);

    // Function to add ANSI escape codes for color
    const colorizeBedState = (csvData) => {
      return csvData.split('\n').map((row, index) => {
        if (index === 0) return row; // Skip header row
        const columns = row.split(',');
        const bedStateIndex = fields.indexOf('Bed State');
        if (bedStateIndex !== -1) {
          const bedState = columns[bedStateIndex].trim();
          if (bedState === 'Available') {
            columns[bedStateIndex] = `\x1b[32m${bedState}\x1b[0m`; // Green for available
          } else if (bedState === 'Occupied') {
            columns[bedStateIndex] = `\x1b[31m${bedState}\x1b[0m`; // Red for occupied
          }
          return columns.join(',');
        }
        return row;
      }).join('\n');
    };

    const coloredCsv = colorizeBedState(csv);

    // Set headers to indicate it's a CSV file
    res.header('Content-Type', 'text/csv');
    res.attachment('beds.csv');
    res.send(coloredCsv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Failed to generate CSV file.' });
  }
});








// GET /api/beds/count/total - Returns the total count of beds
router.get('/countbeds', async (req, res) => {
  try {
    const totalBeds = await Bed.countDocuments({});
    res.status(200).json({ totalBeds });
  } catch (error) {
    console.error('Error counting total beds:', error);
    res.status(500).json({ error: 'Failed to count total beds.' });
  }
});

// GET /api/beds/count/free - Returns the count of available (free) beds
router.get('/countbeds/free', async (req, res) => {
  try {
    const freeBeds = await Bed.countDocuments({ state: 'available' });
    res.status(200).json({ freeBeds });
  } catch (error) {
    console.error('Error counting free beds:', error);
    res.status(500).json({ error: 'Failed to count free beds.' });
  }
});


// GET /api/rooms/count - Returns the total count of rooms (Protected)
router.get('/count', async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments({});
    res.status(200).json({ totalRooms: totalRooms });
  } catch (error) {
    console.error('Error counting total rooms:', error);
    res.status(500).json({ error: 'Failed to count total rooms.' });
  }
});


// Function to automatically update room availability
async function updateRoomAvailability(roomId) {
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      console.log(`Room with ID ${roomId} not found.`);
      return;
    }

    // Count the number of available beds in the room
    const availableBedsCount = await Bed.countDocuments({ room: roomId, state: 'available' });

    // If no beds are available, update the room state to 'unavailable'
    if (availableBedsCount === 0) {
      room.state = 'Occupied';
      await room.save();
      console.log(`Room ${room.number} (ID: ${roomId}) is now unavailable.`);
    } else {
      // If at least one bed is available, update the room state to 'available'
      room.state = 'Available';
      await room.save();
      console.log(`Room ${room.number} (ID: ${roomId}) is now available.`);
    }
  } catch (error) {
    console.error('Error updating room availability:', error);
  }
}
router.post('/:roomId/update-availability', async (req, res) => {
  const { roomId } = req.params;

  try {
      await updateRoomAvailability(roomId);
      res.status(200).json({ message: `Availability of room with ID ${roomId} updated successfully.` });
  } catch (error) {
      res.status(500).json({ error: 'Failed to update room availability.' });
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


// UPDATE Bed by ID
router.put("/beds/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBed = await Bed.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedBed) {
      return res.status(404).json({ message: "Bed not found" });
    }

    res.json({ message: "Bed updated successfully", bed: updatedBed });
  } catch (error) {
    res.status(500).json({ message: "Error updating bed", error: error.message });
  }
});


// DELETE Bed by ID
router.delete('/beds/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const deletedBed = await Bed.findByIdAndDelete(id);
      
      if (!deletedBed) {
          return res.status(404).json({ message: "Bed not found" });
      }

      res.json({ message: "Bed deleted successfully", bed: deletedBed });
  } catch (error) {
      res.status(500).json({ message: "Error deleting bed", error: error.message });
  }
});


// Assign a patient to a bed
router.put('/:bedId/assign-patient', async (req, res) => {
  try {
      const { bedId } = req.params;
      const { patientId } = req.body;

      // Check if the bed exists
      const bed = await Bed.findById(bedId);
      if (!bed) {
          return res.status(404).json({ error: "Bed not found" });
      }

      // Check if the user exists and has the role 'patient'
      const patient = await User.findById(patientId);
      if (!patient || patient.role !== 'patient') {
          return res.status(400).json({ error: "The user is not a patient" });
      }

      // Update the bed with the patient ID and change state to "occupied"
      bed.patient = patientId;
      bed.state = "occupied";
      bed.free = false;

      // Save the updated bed
      const updatedBed = await bed.save();

      res.status(200).json({
          message: "Patient assigned to bed successfully",
          bed: updatedBed
      });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});



// Fetch all beds in a specific room by roomId
router.get('/:roomId/beds', async (req, res) => {
    try {
      const { roomId } = req.params; 
  
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
        const rooms = await Room.find().sort({ _id: -1 }); ;
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

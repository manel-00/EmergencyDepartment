// ✅ MongoDB connection
require('./config/db');

// ✅ Required modules
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');
const { spawn } = require("child_process");

// ✅ Initialize Express app
const app = express();
const port = 3000;

// ✅ Import routes
const UserRouter = require('./api/User');
const RoomRouter = require('./api/roomManagement');
const DocumentRouter = require('./api/Document');
const chatRouter = require('./api/chat');
const makeappointmentRouter = require('./api/makeappointment');
const SpecialiteRouter = require('./api/Specialite');
const consultationRouter = require('./api/routes/consultationRoutes');
const rendezVousRouter = require('./api/routes/rendezVousRoutes');
const statisticsRouter = require('./api/routes/statisticsRoutes');
const chatMessageRouter = require('./api/routes/chatMessageRoutes');
const mortalityRouter = require('./routes/mortality');
const paiementRouter = require('./api/routes/paiementRoutes');
const googleCalendarRouter = require('./api/routes/googleCalendarRoutes');
const classificationRouter = require('./api/Classification');
const MaladiepredictionRouter = require('./api/Maladieprediction');

// ✅ Configure CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));

// ✅ Create HTTP server from Express app
const server = http.createServer(app);

// ✅ Initialize Socket.IO with the HTTP server
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST"]
  }
});

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public')); // Servir les fichiers statiques

// ✅ Configure session with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
 // store: MongoStore.create({
   // mongoUrl: "mongodb://localhost:27017/EmergencyMangment",
   // ttl: 24 * 60 * 60 // 1-day session expiry
  //}),
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1-day
  }
}));

// ✅ Test route for session
app.get("/test-session", (req, res) => {
  req.session.test = "Session is working!";
  res.json({ message: "Session saved!", session: req.session });
});

// Route spéciale pour le callback Google Calendar
// Cette route doit être définie AVANT les autres routes pour éviter le middleware d'authentification
const googleCalendarController = require('./api/controllers/googleCalendarController');
app.get('/auth/google/callback', googleCalendarController.handleCallback);

// ✅ Routes
app.use('/user', UserRouter);
app.use('/room', RoomRouter);
app.use('/specialite', SpecialiteRouter);
app.use('/document', DocumentRouter);
app.use('/chat', chatRouter);
app.use('/makeappointment', makeappointmentRouter);
app.use('/api/consultations', consultationRouter);
app.use('/api/paiements', paiementRouter);
app.use('/api/rendez-vous', rendezVousRouter);
app.use('/api/google-calendar', googleCalendarRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/chat-messages', chatMessageRouter);
app.use('/api/mortality', mortalityRouter);
app.use('/classification', classificationRouter);
app.use('/symptomes', MaladiepredictionRouter);

// ✅ Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a consultation room
  socket.on('join-room', (data) => {
    console.log('Join room data:', data);
    let roomId, userId, role;

    // Handle both object format and separate parameters
    if (typeof data === 'object' && data !== null) {
      roomId = data.consultationId;
      userId = data.userId;
      role = data.role;
    } else {
      roomId = data;
      userId = arguments[1];
    }

    if (!roomId) {
      console.error('No room ID provided');
      return;
    }

    console.log(`User ${userId} joining room ${roomId} as ${role || 'unknown role'}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', { userId, role });
  });

  // Join a chat room
  socket.on('join-chat-room', (roomId) => {
    console.log(`Socket ${socket.id} joining chat room: ${roomId}`);
    socket.join(`chat-${roomId}`);
    // Notify others that someone joined the chat
    socket.to(`chat-${roomId}`).emit('chat-user-joined', {
      socketId: socket.id,
      timestamp: Date.now()
    });
  });

  // Handle chat messages
  socket.on('chat-message', (data) => {
    const { consultationId, message } = data;
    console.log(`Chat message in room ${consultationId}:`, message);

    // Ajouter des informations supplémentaires au message si nécessaire
    const enhancedMessage = {
      ...message,
      receivedAt: new Date()
    };

    // Broadcast the message to everyone in the room except the sender
    socket.to(`chat-${consultationId}`).emit('chat-message', enhancedMessage);

    // Envoyer une confirmation au client qui a envoyé le message
    socket.emit('chat-message-sent', {
      success: true,
      messageId: message._id || null,
      timestamp: new Date()
    });
  });

  // Handle WebRTC signaling
  socket.on('offer', (offer, roomId, userId) => {
    console.log(`Received offer from ${userId || 'unknown'} for room ${roomId || 'unknown'}`);
    if (roomId) {
      socket.to(roomId).emit('offer', offer, userId);
    } else if (offer && offer.consultationId) {
      // Handle case where offer is sent as an object with consultationId
      socket.to(offer.consultationId).emit('offer', offer);
      console.log(`Forwarded offer to room ${offer.consultationId}`);
    } else {
      console.error('No room ID provided for offer');
    }
  });

  socket.on('answer', (answer, roomId, userId) => {
    console.log(`Received answer from ${userId || 'unknown'} for room ${roomId || 'unknown'}`);
    if (roomId) {
      socket.to(roomId).emit('answer', answer, userId);
    } else if (answer && answer.consultationId) {
      socket.to(answer.consultationId).emit('answer', answer);
      console.log(`Forwarded answer to room ${answer.consultationId}`);
    } else {
      console.error('No room ID provided for answer');
    }
  });

  socket.on('ice-candidate', (candidate, roomId, userId) => {
    console.log(`Received ICE candidate from ${userId || 'unknown'} for room ${roomId || 'unknown'}`);
    if (roomId) {
      socket.to(roomId).emit('ice-candidate', candidate, userId);
    } else if (candidate && candidate.consultationId) {
      socket.to(candidate.consultationId).emit('ice-candidate', candidate);
      console.log(`Forwarded ICE candidate to room ${candidate.consultationId}`);
    } else {
      console.error('No room ID provided for ICE candidate');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Get all rooms this socket was in
    const rooms = Array.from(socket.rooms);

    // Notify all rooms that this user has disconnected
    rooms.forEach(room => {
      if (room !== socket.id) { // Skip the default room (socket.id)
        console.log(`Notifying room ${room} that user has disconnected`);
        socket.to(room).emit('user-disconnected', {
          socketId: socket.id,
          timestamp: Date.now()
        });
      }
    });
  });
});



app.post('/api/analyze-symptoms', (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms) {
    return res.status(400).json({ error: 'symptoms is required' });
  }

  // Make sure this path matches your folder structure!
  const intentsPath = path.join(__dirname, 'data', 'intents.json');
  if (!fs.existsSync(intentsPath)) {
    return res.status(500).json({ error: 'intents.json file not found' });
  }

  const intents = JSON.parse(fs.readFileSync(intentsPath, 'utf8'));
  const responses = [];

  for (const intent of intents.intents) {
    for (const pattern of intent.patterns) {
      if (symptoms.toLowerCase().includes(pattern.toLowerCase())) {
        responses.push(intent.responses[0]);
        break;
      }
    }
  }

  res.json({ responses });
});


// ✅ Start the server (Express + Socket.IO)
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
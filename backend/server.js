// ✅ MongoDB connection
require('./config/db');

// ✅ Required modules
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs');
const path = require('path');
// ✅ Initialize Express app
const app = express();
const port = 3000;
const socketIo = require('socket.io');
const consultationRouter = require('./api/routes/consultationRoutes');
const rendezVousRouter = require('./api/routes/rendezVousRoutes');

// ✅ Import routes
const UserRouter = require('./api/User');
const RoomRouter = require('./api/roomManagement');
const DocumentRouter = require('./api/Document');
const chatRouter = require('./api/chat');
const makeappointmentRouter = require('./api/makeappointment');
const SpecialiteRouter = require('./api/Specialite');
const paiementRouter = require('./api/routes/paiementRoutes');
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));
const server = http.createServer(app);
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

// ✅ Configure session with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/EmergencyMangment",
    ttl: 24 * 60 * 60 // 1-day session expiry
  }),
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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a consultation room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
  });

  // Handle WebRTC signaling
  socket.on('offer', (offer, roomId, userId) => {
    socket.to(roomId).emit('offer', offer, userId);
  });

  socket.on('answer', (answer, roomId, userId) => {
    socket.to(roomId).emit('answer', answer, userId);
  });

  socket.on('ice-candidate', (candidate, roomId, userId) => {
    socket.to(roomId).emit('ice-candidate', candidate, userId);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

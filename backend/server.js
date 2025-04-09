// MongoDB connection
const connectDB = require('./config/db');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require("cors");
const app = express();
const port = 3000;
const UserRouter = require('./api/User');
const specialiteRouter = require('./api/Specialite');
const RoomRouter = require('./api/roomManagement');
const consultationRouter = require('./api/routes/consultationRoutes');
const paiementRouter = require('./api/routes/paiementRoutes');
const rendezVousRouter = require('./api/routes/rendezVousRoutes');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

// Connexion à la base de données
connectDB();

// ✅ Enable CORS (Make sure credentials are allowed)
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3002"], // Autorise les 2 frontends
  credentials: true, // Important pour cookies + sessions
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Enable Cookie Parser
app.use(cookieParser());

// ✅ Configure Express Sessions with MongoDB Store
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/EmergencyMangment", // ✅ Replace with your database
    ttl: 24 * 60 * 60 // ✅ 1-day session expiry
  }),
  cookie: {
    httpOnly: true,
    secure: false, // ✅ Change to `true` if using HTTPS
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 // ✅ 1-day expiration
  }
}));

// ✅ Test Session Route
app.get("/test-session", (req, res) => {
  req.session.test = "Session is working!";
  res.json({ message: "Session saved!", session: req.session });
});

// Routes
app.use('/user', UserRouter);
app.use('/room', RoomRouter);
app.use('/specialite', specialiteRouter);

// Routes de téléconsultation
app.use('/api/consultations', consultationRouter);
app.use('/api/paiements', paiementRouter);
app.use('/api/rendez-vous', rendezVousRouter);

// WebRTC Signaling
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST"]
  }
});

// WebRTC Signaling
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

// Start server
server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

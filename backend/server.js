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

// ✅ Initialize Express app
const app = express();
const port = 3000;

// ✅ Import routes
const UserRouter = require('./api/User');
const RoomRouter = require('./api/roomManagement');
const DocumentRouter = require('./api/Document');
const SpecialiteRouter = require('./api/Specialite');

// ✅ Enable CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));

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

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

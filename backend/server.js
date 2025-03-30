// MongoDB connection
require('./config/db');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require("cors");
const app = express();
const port = 3000;
const UserRouter = require('./api/User');
const RoomRouter = require('./api/roomManagement');

const specialiteRouter = require('./api/Specialite');
require('dotenv').config();
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

// ✅ Enable CORS (Make sure credentials are allowed)
app.use(cors({
  origin: ["http://localhost:5173","http://localhost:3001", "http://localhost:3002"], // ✅ Allow both
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

app.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
});

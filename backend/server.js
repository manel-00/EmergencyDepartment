// MongoDB connection
require('./config/db');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require("cors");
const app = express();
const port = 3000;
const chatRouter = require('./api/chat');
const UserRouter = require('./api/User');
const specialiteRouter = require('./api/Specialite');
const makeappointmentRouter = require('./api/makeappointment');
require('dotenv').config();
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
// ✅ Enable CORS (Make sure credentials are allowed)
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3002"], // Autorise les 2 frontends
  credentials: true, 
 
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
app.use('/specialite', specialiteRouter);
app.use('/chat', chatRouter);
app.use('/makeappointment', makeappointmentRouter);
app.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
});

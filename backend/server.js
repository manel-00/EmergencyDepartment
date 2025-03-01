// MongoDB connection
require('./config/db'); // Ensure this file properly connects to MongoDB
const express = require('express');
const session = require('express-session');
const passport =require('passport'); 
const cors = require("cors");

const app = express();
const port = 3000;
const UserRouter = require('./api/User');
const specialiteRouter = require('./api/Specialite'); 

//user sessions
const MongoStore = require('connect-mongo'); // Optional, for storing sessions in MongoDB
/*
// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,  // Store secret key in .env
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" },  // Secure cookies in production (set 'secure: true' only for HTTPS)
  store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // MongoDB connection URI
      collectionName: 'sessions'  // Where to store session data
  })
}));

*/






require('dotenv').config();
// ✅ Active CORS avant de définir les routes
app.use(cors({ 
  
  //fx original one :origin: "http://localhost:3002",
  origin: ["http://localhost:3001", "http://localhost:3002"], // ✅ Allow both
  credentials: true 
}));

// Middleware pour parser JSON
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // ✅ Permet de lire les formulaires (x-www-form-urlencoded)

// Session configuration
app.use(session({
  secret: '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', // It's better to use a different secret key for sessions
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto', httpOnly: true } // Secure auto will use secure cookies if the site is using HTTPS
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use('/user', UserRouter);
app.use('/specialite', specialiteRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

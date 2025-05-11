const mongoose = require('mongoose');

// Define the schema for the user
const UserVerificationSchema = new mongoose.Schema({
    userId:String, 
    uniqueString:String,
    createdAt: Date,
    expiredAt: Date,

});

// Create the User model based on the schema
const UserVerification = mongoose.model('UserVerification', UserVerificationSchema);

module.exports = UserVerification; // Export the User model

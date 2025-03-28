const mongoose = require('mongoose');

// Define the schema for the user
const PasswordResetSchema = new mongoose.Schema({
    userId:String, 
    resetString:String,
    createdAt: Date,
    expiredAt: Date,

});

// Create the User model based on the schema
const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);

module.exports = PasswordReset; // Export the User model

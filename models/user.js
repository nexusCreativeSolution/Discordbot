// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    lastDailyClaim: { type: Date, default: null },
    balance: { type: Number, default: 0 },
    username: { type: String, required: true },
    // Add other fields as needed
});

module.exports = mongoose.model('User', userSchema);

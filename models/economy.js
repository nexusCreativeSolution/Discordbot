const mongoose = require('mongoose');

const economySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    balance: { type: Number, default: 0 },
    lastWorkClaim: { type: Date, default: null }, // Add this field
});

module.exports = mongoose.model('Economy', economySchema);

const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    messageCount: { type: Number, default: 0 } // New field for message count
});

module.exports = mongoose.model('Level', levelSchema);

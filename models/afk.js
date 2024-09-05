const mongoose = require('mongoose');

const afkSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    reason: { type: String, default: 'No reason provided' },
});

module.exports = mongoose.model('Afk', afkSchema);

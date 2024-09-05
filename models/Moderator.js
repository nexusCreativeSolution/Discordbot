const mongoose = require('mongoose');

const moderatorSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true }
});

module.exports = mongoose.model('Moderator', moderatorSchema);

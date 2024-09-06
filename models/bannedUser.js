const mongoose = require('mongoose');

const bannedUserSchema = new mongoose.Schema({
    userId: String,
    username: String
});

module.exports = mongoose.model('BannedUser', bannedUserSchema);

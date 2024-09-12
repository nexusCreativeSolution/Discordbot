const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  lastDailyClaim: { type: Date, default: null },
  balance: { type: Number, default: 0 },
  username: { type: String },
  chatId: { type: String, unique: true },
  chatIdentifier: { type: String, unique: true },
  userIdentifier: { type: String, unique: true },
});

module.exports = mongoose.model('User', userSchema);

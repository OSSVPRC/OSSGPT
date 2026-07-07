const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  question: { type: String, required: true },
  reply: { type: String, required: true },
  sources: [{ name: String, score: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);

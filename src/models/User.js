const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

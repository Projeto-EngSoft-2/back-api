const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: {
    type: String,
    enum: ['Animal', 'Infraestrutura', 'Energia', 'Água', 'Sujeira', 'Ambiental'],
    required: true
  },
  status: {
    type: String,
    enum: ['avaliação', 'aberto', 'solucionado', 'recusado', 'concluído', 'urgente'],
    default: 'avaliação'
  },
  userId: { type: String, required: true },
  
  reportId: {
    type: String,
    unique: true,
    required: true,
    default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema); 
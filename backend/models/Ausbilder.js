const mongoose = require('mongoose');

const AusbilderSchema = new mongoose.Schema({
  name: String,
  birthday: Date,
  username: String,
  password: String,
  role: {
    type: String,
    enum: ['Azubi', 'Ausbilder', 'Admin'],
    default: 'Ausbilder'
  },
  ausbildung: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ausbildung'
  }]
});

module.exports = mongoose.model('Ausbilder', AusbilderSchema);

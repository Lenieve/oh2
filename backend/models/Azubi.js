const mongoose = require('mongoose');

const AzubiSchema = new mongoose.Schema({
  name: String,
  birthday: Date,
  ausbildung: {  // Achte auf die Schreibweise von 'ausbildung'
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ausbildung'  // Achte auf die Schreibweise von 'Ausbildung'
  },
  ausbilder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ausbilder',
    required: true
  },
  username: String,
  password: String,
  role: {
    type: String,
    enum: ['Azubi', 'Ausbilder', 'Admin'],
    default: 'Azubi'
  },
  wunschliste: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wunschliste'
  }
});

module.exports = mongoose.model('Azubi', AzubiSchema);

const mongoose = require('mongoose');

const kalenderSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Azubi' // oder der Name des Mongoose-Modells, das Sie für Azubis verwenden
  },

  // Andere relevante Felder...
});

const Kalender = mongoose.model('Kalender', kalenderSchema);

module.exports = Kalender;

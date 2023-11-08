const mongoose = require('mongoose');

const WunschlisteSchema = new mongoose.Schema({
  azubi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Azubi',
    required: true
  },
  items: [{
    name: String,
    beschreibung: String,
    erledigt: {
      type: Boolean,
      default: false
    }
  }],
});

module.exports = mongoose.model('Wunschliste', WunschlisteSchema);

const mongoose = require('mongoose');

const AusbildungSchema = new mongoose.Schema({
  name: String,
  ausbilder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ausbilder'
  },
  azubis: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Azubi'  
  }]
});

module.exports = mongoose.model('Ausbildung', AusbildungSchema);

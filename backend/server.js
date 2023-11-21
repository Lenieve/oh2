process.env.TZ = 'UTC';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const cors = require('cors');





// Importiere die Routen
const authRoutes = require('./routes/authRoutes');
const azubiRoutes = require('./routes/azubiRoutes');
const ausbilderRoutes = require('./routes/ausbilderRoutes');
const ausbildungRoutes = require('./routes/ausbildungRoutes');
const wunschlisteRoutes = require('./routes/wunschlisteRoutes'); // Der Pfad sollte korrekt sein
const kalenderRoutes = require('./routes/kalenderRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

const countdownRoutes = require('./routes/countdownRoutes'); //

// Verbindung zur MongoDB Datenbank
mongoose.connect('mongodb://localhost:27017/tester', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Could not connect to MongoDB:', err);
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001', // this is the frontend's address
  methods: 'GET,POST,PUT,DELETE', // the HTTP methods you want to allow
  credentials: true, // this should be set to true if you are handling cookies or auth tokens
  optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));



// Verbinde die Routen mit der Anwendung
app.use('/auth', authRoutes);
app.use('/azubi', azubiRoutes);
app.use('/ausbilder', ausbilderRoutes);
app.use('/ausbildung', ausbildungRoutes);
app.use('/wunschliste', wunschlisteRoutes);
app.use('/kalender', kalenderRoutes);
app.get('/countdown/:userId',countdownRoutes);
app.get('/next-birthday', countdownRoutes); 

module.exports = app;

if (require.main === module) {
  // Der Server wird nur gestartet, wenn die Datei direkt aufgerufen wird (z.B. mit node server.js)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


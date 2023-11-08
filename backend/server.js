require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();



// Importiere die Routen
const authRoutes = require('./routes/authRoutes');
const azubiRoutes = require('./routes/azubiRoutes');
const ausbilderRoutes = require('./routes/ausbilderRoutes');
const ausbildungRoutes = require('./routes/ausbildungRoutes');
const wunschlisteRoutes = require('./routes/wunschlisteRoutes'); // Der Pfad sollte korrekt sein
const kalenderRoutes = require('./routes/kalenderRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

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

// Verbinde die Routen mit der Anwendung
app.use('/auth', authRoutes);
app.use('/azubi', azubiRoutes);
app.use('/ausbilder', ausbilderRoutes);
app.use('/ausbildung', ausbildungRoutes);
app.use('/wunschliste', wunschlisteRoutes);
app.use('/kalender', kalenderRoutes);



// Starte den Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

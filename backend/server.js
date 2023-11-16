process.env.TZ = 'UTC';
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

const calculateCountdown = require('./countdown');

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
app.get('/countdown/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const countdown = calculateCountdown(user.birthday);
    res.json(countdown);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = app;

if (require.main === module) {
  // Der Server wird nur gestartet, wenn die Datei direkt aufgerufen wird (z.B. mit node server.js)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


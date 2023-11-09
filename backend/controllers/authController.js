const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Ausbildung = require('../models/Ausbildung');
const Azubi = require('../models/Azubi');
const Ausbilder = require('../models/Ausbilder');
const Kalender = require('../models/Kalender');

exports.register = async (req, res) => {
  try {
    const { username, password, role, name, birthday, ausbildung, ausbilder } = req.body;

    if (!username || !password || !role || !name || !birthday || !ausbildung) {
      return res.status(400).send({ message: 'Alle Felder müssen ausgefüllt sein' });
    }

    let user;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'Ausbilder') {
      if (!Array.isArray(ausbildung)) {
        return res.status(400).send({ message: 'Ausbildung muss ein Array sein' });
      }
      for (const id of ausbildung) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).send({ message: `Ungültige Ausbildung ID: ${id}` });
        }
        const ausbildungExists = await Ausbildung.findById(id);
        if (!ausbildungExists) {
          return res.status(400).send({ message: `Ungültige Ausbildung mit der ID ${id}` });
        }
      }
      user = new Ausbilder({ username, password: hashedPassword, name, birthday, ausbildung });
    } else { // Azubi
      if (!mongoose.Types.ObjectId.isValid(ausbildung)) {
        return res.status(400).send({ message: 'Ungültige Ausbildung ID' });
      }
      const ausbildungExists = await Ausbildung.findById(ausbildung);
      if (!ausbildungExists) {
        return res.status(400).send({ message: 'Ungültige Ausbildung' });
      }
      if (ausbilder && !mongoose.Types.ObjectId.isValid(ausbilder)) {
        return res.status(400).send({ message: 'Ungültige Ausbilder ID' });
      }
      const ausbilderExists = ausbilder ? await Ausbilder.findById(ausbilder) : null;
      if (ausbilder && !ausbilderExists) {
        return res.status(400).send({ message: 'Ungültiger Ausbilder' });
      }
      user = new Azubi({ username, password: hashedPassword, name, birthday, ausbildung, ausbilder });
    }

    const savedUser = await user.save();

    // Kalenderereignis für den Geburtstag erstellen
    const birthdayEvent = new Kalender({
      title: `Geburtstag von ${name}`,
      description: 'Geburtstagsfeier',
      startDateTime: birthday,
      endDateTime: new Date(new Date(birthday).setHours(23, 59, 59, 999)),
      relatedId: savedUser._id
    });
    await birthdayEvent.save();
    // Ausbildung und Ausbilder aktualisieren
    if (role === 'Ausbilder') {
      for (const id of ausbildung) {
        await Ausbildung.findByIdAndUpdate(id, { $set: { ausbilder: savedUser._id } });
      }
    } else { // Azubi
      if (ausbilder) {
        await Ausbilder.findByIdAndUpdate(ausbilder, { $push: { azubis: savedUser._id } });
      }
}

    // Token erstellen und senden
    const payload = {
      userId: savedUser._id,
      role: savedUser.role
    };
    const token = jwt.sign({ data: payload }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user: savedUser, event: birthdayEvent });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};





exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Überprüfe, ob Benutzername und Passwort eingegeben wurden
    if (!username || !password) {
      return res.status(400).send('Benutzername und Passwort müssen angegeben werden.');
    }

    // Suche nach dem Benutzer in der Datenbank
    let user = await Ausbilder.findOne({ username }) || await Azubi.findOne({ username });

    // Überprüfe, ob der Benutzer existiert
    if (!user) {
      return res.status(401).send('Anmeldedaten sind ungültig.');
    }

    // Überprüfe das Passwort
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send('Anmeldedaten sind ungültig.');
    }

    // Erstelle und sende den JWT-Token
    const payload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign({ data: payload }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token: token,
      message: 'Erfolgreich angemeldet.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ein Fehler ist aufgetreten.');
  }
};

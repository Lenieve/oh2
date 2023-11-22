const Ausbilder = require('../models/Ausbilder');
const Ausbildung = require('../models/Ausbildung');
const Azubi = require('/Users/jacquelineloewe/yannickihkgitrepo/oh2/backend/models/Azubi.js');
const Kalender = require('../models/Kalender');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Ensure you have bcryptjs installed for password hashing

exports.createAusbilder = async (req, res) => {
  try {
    const { name, birthday, ausbildung, username, password } = req.body;

    // Validate required fields
    if (!name || !birthday || !ausbildung || ausbildung.length === 0 || !username || !password) {
      return res.status(400).send({ message: 'Alle Felder müssen ausgefüllt sein' });
    }

    // Check if the username already exists
    const usernameExists = await Ausbilder.findOne({ username });
    if (usernameExists) {
      return res.status(400).send({ message: 'Benutzername existiert bereits' });
    }

    // Check if the provided Ausbildungen IDs are valid and don't already have an Ausbilder
    for (const id of ausbildung) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: `Ungültige Ausbildung mit der ID ${id}` });
      }
      const ausbildungExists = await Ausbildung.findById(id);
      if (!ausbildungExists || ausbildungExists.ausbilder) {
        return res.status(400).send({ message: `Die Ausbildung mit der ID ${id} hat bereits einen Ausbilder oder ist ungültig.` });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the Ausbilder
    const ausbilder = new Ausbilder({
      name,
      birthday,
      ausbildung,
      username,
      password: hashedPassword,
      role: 'Ausbilder' // or use req.body.role if role should be set dynamically
    });

    await ausbilder.save();

    // Update Ausbildung documents with the new Ausbilder ID
    for (const id of ausbildung) {
      await Ausbildung.findByIdAndUpdate(id, { $set: { ausbilder: ausbilder._id } });
    }

    res.status(201).send(ausbilder);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};


// Logik zum Abrufen der Details eines Ausbilders
exports.getAusbilderById = async (req, res) => {
  try {
    const ausbilder = await Ausbilder.findById(req.params.id);
    if (!ausbilder) return res.status(404).send({ message: 'Ausbilder nicht gefunden' });
    res.status(200).send(ausbilder);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};


exports.deleteAusbilder = async (req, res) => {
  try {
    const ausbilderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ausbilderId)) {
      return res.status(400).send({ message: `Ungültige Ausbilder ID: ${ausbilderId}` });
    }

    // Check if Ausbilder exists
    const ausbilderExists = await Ausbilder.findById(ausbilderId);
    if (!ausbilderExists) {
      return res.status(404).send({ message: 'Ausbilder nicht gefunden' });
    }

    // Überprüfen, ob der Ausbilder noch Azubis hat
    const azubisCount = await Azubi.countDocuments({ ausbilder: ausbilderId });
    if (azubisCount > 0) {
      return res.status(400).send({ message: 'Dieser Ausbilder hat noch Azubis und kann nicht gelöscht werden.' });
    }

    // Ausbilder aus allen zugehörigen Ausbildungen entfernen
    await Ausbildung.updateMany(
      { ausbilder: ausbilderId },
      { $unset: { ausbilder: "" } }
    );

    // Zugehöriges Kalenderereignis löschen
    const event = await Kalender.findOne({ relatedId: ausbilderId });
    if (event) {
      await event.remove();
    }

    // Ausbilder löschen
    await Ausbilder.findByIdAndDelete(ausbilderId);

    res.status(200).send({ message: 'Ausbilder und zugehöriges Kalenderereignis erfolgreich gelöscht' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};





exports.updateAusbilder = async (req, res) => {
  try {
      const ausbilderId = req.params.id;
      const { name, birthday, ausbildung } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(ausbilderId)) {
        return res.status(400).send({ message: `Ungültige Ausbilder ID: ${ausbilderId}` });
      }
  
      const ausbilder = await Ausbilder.findById(ausbilderId);
      if (!ausbilder) {
        return res.status(404).send({ message: 'Ausbilder nicht gefunden' });
      }
  
      // Validate Ausbildung IDs
      for (const id of ausbildung) {
        if (!mongoose.Types.ObjectId.isValid(id) || !(await Ausbildung.findById(id))) {
          return res.status(400).send({ message: `Ungültige Ausbildung ID: ${id}` });
        }
      }

    // Check if the birthday is being changed
    const birthdayChanged = birthday && birthday !== ausbilder.birthday.toISOString();

    // Entfernen des Ausbilders aus allen alten Ausbildungen
    await Ausbildung.updateMany(
      { ausbilder: ausbilderId },
      { $set: { ausbilder: ausbilderId } }
    );

    // Hinzufügen des Ausbilders zu den neuen Ausbildungen
    for (const id of ausbildung) {
      await Ausbildung.findByIdAndUpdate(id, { $set: { ausbilder: ausbilderId } });
    }

    // Aktualisieren des Ausbilders mit den neuen Informationen
    ausbilder.name = name || ausbilder.name;
    ausbilder.birthday = birthday || ausbilder.birthday;
    ausbilder.ausbildung = ausbildung || ausbilder.ausbildung;
    await ausbilder.save();

    if (birthdayChanged) {
      const event = await Kalender.findOne({ relatedId: ausbilder._id });
      if (event) {
        event.date = new Date(birthday);
        await event.save();
      } else {
        console.log(`Kein Kalenderereignis für Ausbilder ID ${ausbilderId} gefunden.`);
      }
    }

    res.status(200).send({ message: 'Ausbilder erfolgreich aktualisiert', data: ausbilder });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Ausbilders:', error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};






// Logik zum Auflisten der Azubis eines bestimmten Ausbilders
exports.listAzubisByAusbilder = async (req, res) => {
  try {
    const ausbilderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ausbilderId)) {
      return res.status(400).send({ message: `Ungültige Ausbilder ID: ${ausbilderId}` });
    }

    // Finden aller Azubis, die diesem Ausbilder gehören
    const azubis = await Azubi.find({ ausbilder: ausbilderId });

    if (!azubis.length) {
      return res.status(404).send({ message: 'Keine Azubis gefunden' });
    }

    res.status(200).send(azubis);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};


// Logik zum Anzeigen der Geburtstage der Azubis
exports.listBirthdays = async (req, res) => {
  try {
    const ausbilderId = req.params.id;
    const azubis = await Azubi.find({ ausbilder: ausbilderId }, 'birthday');
    if (!azubis.length) return res.status(404).send({ message: 'Keine Geburtstage gefunden' });
    // Hier können Sie einen Countdown für jeden Geburtstag hinzufügen
    res.status(200).send(azubis.map(a => a.birthday));
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};


exports.listAusbilder = async (req, res) => {
  try {
    const ausbilder = await Ausbilder.find();
    if (!ausbilder.length) {
      return res.status(404).send({ message: 'Keine Ausbilder gefunden' });
    }
    res.status(200).send(ausbilder);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};

// Logik zum Auflisten der Ausbildungen eines bestimmten Ausbilders
exports.listAusbildungenByAusbilder = async (req, res) => {
  try {
    const ausbilderId = req.params.id;
    const ausbildungen = await Ausbildung.find({ ausbilder: ausbilderId });
    if (!ausbildungen.length) {
      return res.status(404).send({ message: 'Keine Ausbildungen gefunden' });
    }
    res.status(200).send(ausbildungen);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};

const Ausbilder = require('../models/Ausbilder');
const Azubi = require('../models/Azubi');
const Ausbildung = require('../models/Ausbildung');
const mongoose = require('mongoose');
const Kalender = require('../models/Kalender'); // Pfad anpassen, falls nötig

// Logik zum Erstellen eines Ausbilders
exports.createAusbilder = async (req, res) => {
  
  try {
    const { name, birthday, ausbildung } = req.body;
    if (!name || !birthday || !ausbildung || ausbildung.length === 0) {
      return res.status(400).send({ message: 'Alle Felder müssen ausgefüllt sein' });
    }

    // Überprüfen, ob alle Ausbildungen existieren
    for (const id of ausbildung) {
      const ausbildungExists = await Ausbildung.findById(id);
      if (!ausbildungExists) {
        return res.status(400).send({ message: `Ungültige Ausbildung mit der ID ${id}` });
      }
    }

    // Überprüfen, ob bereits ein Ausbilder für diese Ausbildung(en) existiert
    for (const id of ausbildung) {
      const existingAusbildung = await Ausbildung.findById(id);
      if (existingAusbildung.ausbilder) {
        return res.status(400).send({ message: `Die Ausbildung mit der ID ${id} hat bereits einen Ausbilder.` });
      }
    }

    const ausbilder = new Ausbilder({ name, birthday, ausbildung });
    await ausbilder.save();

    // Aktualisieren der Ausbildungen mit der neuen Ausbilder-ID
    for (const id of ausbildung) {
      await Ausbildung.findByIdAndUpdate(id, { $push: { ausbilder: ausbilder._id } });
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
    const event = await Kalender.findOne({ relatedId: ausbilder._id });
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
      const event = await Kalender.findOne({ relatedId: ausbilder._id }); // Stellen Sie sicher, dass es ausbilder._id ist
      if (event) {
        event.startDateTime = new Date(birthday);
        event.endDateTime = new Date(new Date(birthday).setHours(23, 59, 59, 999));
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
    // Finden aller Ausbildungen, die diesem Ausbilder gehören
    const ausbildungen = await Ausbildung.find({ ausbilder: ausbilderId });
    
    if (!ausbildungen.length) return res.status(404).send({ message: 'Keine Ausbildungen gefunden' });

    const ausbildungIds = ausbildungen.map(a => a._id);
    
    // Finden aller Azubis, die zu diesen Ausbildungen gehören
    const azubis = await Azubi.find({ ausbildung: { $in: ausbildungIds } });

    if (!azubis.length) return res.status(404).send({ message: 'Keine Azubis gefunden' });

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

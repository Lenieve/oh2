const Azubi = require('../models/Azubi');
const Ausbildung = require('../models/Ausbildung');
const mongoose = require('mongoose');
const Kalender = require('../models/Kalender'); // Pfad anpassen, falls nötig

// Logik zum Erstellen eines Azubis
// Beispiel einer Validierung vor dem Speichern
// Logik zum Erstellen eines Azubis
/*exports.createAzubi = async (req, res) => {
  console.log('createAzubi function called with data:', req.body);
  try {
    const { name, birthday, ausbildung } = req.body;
    if (!name || !birthday || !ausbildung) {
      return res.status(400).send({ message: 'Alle Felder müssen ausgefüllt sein' });
    }

    const ausbildungExists = await Ausbildung.findById(ausbildung); // Achte auf die Schreibweise von 'Ausbildung'
    if (!ausbildungExists) {
      return res.status(400).send({ message: 'Ungültige Ausbildung' });
    }

    const azubi = new Azubi({ name, birthday, ausbildung }); // Achte auf die Schreibweise von 'ausbildung'
    await azubi.save();

    // Aktualisieren der Ausbildung mit der neuen Azubi-ID
    await Ausbildung.findByIdAndUpdate(ausbildung, { $push: { azubis: azubi._id } });

    res.status(201).send(azubi);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};
*/

// In Ihrem azubiController.js
exports.deleteAzubi = async (req, res) => {
  try {
    const azubiId = req.params.id;

    // Finden des Azubis und Überprüfen, ob er existiert
    const azubi = await Azubi.findById(azubiId);
    if (!azubi) {
      return res.status(404).send({ message: 'Azubi nicht gefunden' });
    }

    // Entfernen des Azubis aus der zugehörigen Ausbildung
    await Ausbildung.findByIdAndUpdate(azubi.ausbildung, { $pull: { azubis: azubiId } });

    // Löschen des Azubis
    await Azubi.findByIdAndDelete(azubiId);

    res.status(200).send({ message: 'Azubi erfolgreich gelöscht' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};




// Logik zum Abrufen eines Azubis
exports.getAzubiById = async (req, res) => {
  try {
    const azubi = await Azubi.findById(req.params.id);
    if (!azubi) return res.status(404).send({ message: 'Azubi nicht gefunden' });
    res.status(200).send(azubi);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};

exports.updateAzubi = async (req, res) => {
  try {
    const azubiId = req.params.id.trim();
    const { name, birthday, ausbildung } = req.body;

    if (!mongoose.Types.ObjectId.isValid(azubiId)) {
      return res.status(400).send({ message: `Ungültige Azubi ID: ${azubiId}` });
    }

    if (ausbildung && !mongoose.Types.ObjectId.isValid(ausbildung.trim())) {
      return res.status(400).send({ message: `Ungültige Ausbildung ID: ${ausbildung}` });
    }

    // Finden des Azubis vor der Aktualisierung, um das alte Geburtsdatum zu erhalten
    const azubi = await Azubi.findById(azubiId);
    if (!azubi) {
      return res.status(404).send({ message: 'Azubi nicht gefunden' });
    }

    const birthdayChanged = birthday && new Date(azubi.birthday).getTime() !== new Date(birthday).getTime();

    // Aktualisieren des Azubis mit den neuen Informationen
    const updatedAzubi = await Azubi.findByIdAndUpdate(azubiId, {
      name: name || azubi.name,
      birthday: birthday || azubi.birthday,
      ausbildung: ausbildung || azubi.ausbildung,
    }, { new: true });

    // Wenn sich das Geburtsdatum geändert hat, aktualisiere das Kalenderereignis
    if (birthdayChanged) {
      const event = await Kalender.findOne({ relatedId: azubiId });
      if (event) {
        event.date = new Date(birthday);
        await event.save();
      }
    }

    res.status(200).send({ message: 'Azubi erfolgreich aktualisiert', data: updatedAzubi });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};



exports.getAllAzubis = async (req, res) => {
  try {
    const azubis = await Azubi.find();  // Finden aller Azubis in der Datenbank
    if (!azubis.length) {
      return res.status(404).send({ message: 'Keine Azubis gefunden' });
    }
    res.status(200).send(azubis);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};


// Logik zum Anzeigen des Wunschzettels eines Azubis
exports.viewWishlist = async (req, res) => {
  try {
    const azubi = await Azubi.findById(req.params.id, 'wishList');
    if (!azubi) return res.status(404).send({ message: 'Azubi nicht gefunden' });
    res.status(200).send(azubi.wishList);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};

// Logik zum Anzeigen der Geburtstage der Azubis
exports.listBirthdays = async (req, res) => {
  try {
    const azubis = await Azubi.find({}, 'birthday');
    if (!azubis.length) return res.status(404).send({ message: 'Keine Geburtstage gefunden' });
    // Hier können Sie einen Countdown für jeden Geburtstag hinzufügen
    res.status(200).send(azubis.map(a => a.birthday));
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};

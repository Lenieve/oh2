const Ausbildung = require('../models/Ausbildung');
const Azubi = require('../models/Azubi');
const Ausbilder = require('../models/Ausbilder');
const mongoose = require('mongoose');
const Kalender = require('../models/Kalender');
// Logik zum Erstellen einer Ausbildung
exports.createAusbildung = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ message: 'Name der Ausbildung muss angegeben werden' });
    }
    const ausbildung = new Ausbildung({ name });
    await ausbildung.save();
    res.status(201).send(ausbildung);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};

exports.deleteAusbildung = async (req, res) => {
  try {
    const id = req.params.id;

    // Ausbildung finden
    const ausbildung = await Ausbildung.findById(id);

    if (!ausbildung) {
      return res.status(404).send({ message: 'Ausbildung nicht gefunden' });
    }

    // Überprüfen, ob die Ausbildung Azubis oder einen Ausbilder hat
    if (ausbildung.azubis.length > 0 || ausbildung.ausbilder) {
      return res.status(400).send({
        message: 'Diese Ausbildung hat Azubis oder einen Ausbilder und kann nicht gelöscht werden.',
      });
    }

    // Ausbildung löschen
    await Ausbildung.findByIdAndDelete(id);

    res.status(200).send({ message: 'Ausbildung erfolgreich gelöscht' });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};
//getAusbildungById method
exports.getAusbildungById = async (req, res) => {
  try {
    const id = req.params.id;
    
    console.log(`Suche Ausbildung mit ID: ${id}`);

    // Überprüfen, ob ID eine gültige ObjectId ist
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: `Ungültige Ausbildung ID: ${id}` });
    }

    const ausbildung = await Ausbildung.findById(id);

    if (!ausbildung) {
      console.log(`Ausbildung mit ID ${id} nicht gefunden.`);
      return res.status(404).send({ message: 'Ausbildung nicht gefunden' });
    }

    console.log(`Ausbildung gefunden: ${JSON.stringify(ausbildung)}`);
    res.status(200).send(ausbildung);

  } catch (error) {
    console.error('Fehler bei der Suche nach Ausbildung:', error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};

//updateAusbildung method
exports.updateAusbildung = async (req, res) => {
  try {
    const ausbildungId = req.params.id; // ID der zu aktualisierenden Ausbildung
    const updates = req.body; // Die neuen Daten für die Ausbildung

    // Überprüfen, ob ausbildungId eine gültige ObjectId ist
    if (!mongoose.Types.ObjectId.isValid(ausbildungId)) {
      return res.status(400).send({ message: `Ungültige Ausbildung ID: ${ausbildungId}` });
    }

    const ausbildung = await Ausbildung.findByIdAndUpdate(ausbildungId, updates, { new: true });

    if (!ausbildung) {
      return res.status(404).send({ message: 'Ausbildung nicht gefunden' });
    }

    res.status(200).send({ message: 'Ausbildung erfolgreich aktualisiert', data: ausbildung });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};


// ... andere Methoden wie getAusbildungById, updateAusbildung hier

// Logik zum Anzeigen von Azubis einer Ausbildung
exports.listAzubisByAusbildung = async (req, res) => {
    console.log("listAzubisByAusbildung wird aufgerufen");
    console.log("ID aus Request:", req.params.id);
    try {
      const azubis = await Azubi.find({ 'ausbildung': req.params.id });  // Achte auf die Schreibweise von 'ausbildung'
      res.status(200).send(azubis);
    } catch (error) {
      console.error("Fehler:", error);
      res.status(500).send({ message: 'Serverfehler' });
    }
  };

// Logik zum Anzeigen von Ausbildern einer Ausbildung
exports.listAusbilderByAusbildung = async (req, res) => {
  try {
    const ausbilder = await Ausbilder.find({ 'ausbildung': req.params.id });
    res.status(200).send(ausbilder);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};
exports.listAusbildung = async (req, res) => {
  try {
    const ausbildungen = await Ausbildung.find();
    res.status(200).send(ausbildungen);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Serverfehler' });
  }
};

const Wunschliste = require('../models/Wunschliste');
const Azubi = require('../models/Azubi');
const mongoose = require('mongoose');

// Wunschliste erstellen
exports.createWunschliste = async (req, res) => {
    console.log("createWunschliste aufgerufen");
    console.log("Request Body:", req.body); // Dies zeigt Ihnen die genauen Daten, die ankommen

    try {
        const { azubiId, items } = req.body;
        console.log("Azubi ID:", azubiId);
        console.log("Items:", items); // Dies sollte die Liste der Items zeigen, die Sie erwarten

        const wunschliste = new Wunschliste({
            azubi: azubiId,
            items: items // Stellen Sie sicher, dass dies ein Array von Objekten ist
        });

        console.log("Wunschliste vor dem Speichern:", wunschliste);
        await wunschliste.save();
        console.log("Wunschliste nach dem Speichern:", wunschliste);

        res.status(201).json(wunschliste);
    } catch (error) {
        console.error("Fehler beim Erstellen der Wunschliste:", error);
        res.status(400).json({ message: "Wunschliste konnte nicht erstellt werden.", error: error });
    }
};


// Wunschliste eines Azubis abrufen
exports.getWunschlisteByAzubi = async (req, res) => {
  try {
    const { azubiId } = req.params;
    const wunschliste = await Wunschliste.findOne({ azubi: azubiId });
    if (!wunschliste) {
      return res.status(404).json({ message: "Wunschliste nicht gefunden." });
    }
    res.json(wunschliste);
  } catch (error) {
    res.status(400).json({ message: "Fehler beim Abrufen der Wunschliste.", error: error });
  }
};

// Wunschliste aktualisieren
exports.updateWunschliste = async (req, res) => {
    const wunschlisteId = req.params.id;
    const { items } = req.body; // Nehmen Sie an, dass die aktualisierten Items im Request-Body gesendet werden
    console.log("Update Wunschliste aufgerufen für ID:", wunschlisteId);

    try {
        const wunschliste = await Wunschliste.findById(wunschlisteId);
        if (!wunschliste) {
            console.log("Keine Wunschliste mit dieser ID gefunden.");
            return res.status(404).json({ message: "Wunschliste nicht gefunden." });
        }

        // Aktualisieren Sie die Wunschliste mit den neuen Daten
        wunschliste.items = items; // oder verwenden Sie eine Schleife, um spezifische Items zu aktualisieren
        wunschliste.markModified('items'); // Dies ist notwendig, wenn Sie mit subdocuments oder mixed Types arbeiten
        await wunschliste.save(); // Speichern Sie die Änderungen in der Datenbank

        console.log("Wunschliste aktualisiert:", wunschliste);
        res.status(200).json(wunschliste);
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Wunschliste:", error);
        res.status(500).json({ message: "Fehler beim Aktualisieren der Wunschliste.", error: error });
    }
};


exports.deleteWunschliste = async (req, res) => {
    try {
      // Extrahieren Sie die azubiId aus den Parametern
      const azubiId = req.params.azubiId;
      console.log("azubiId für das Löschen der Wunschliste erhalten:", azubiId);
  
      // Verwenden Sie die azubiId, um die Wunschliste zu finden und zu löschen
      const wunschliste = await Wunschliste.findOneAndDelete({ azubi: azubiId });
      if (!wunschliste) {
        return res.status(404).json({ message: "Wunschliste nicht gefunden." });
      }
      res.status(200).json({ message: "Wunschliste erfolgreich gelöscht." });
    } catch (error) {
      res.status(500).json({ message: "Fehler beim Löschen der Wunschliste.", error: error });
    }
  };
  
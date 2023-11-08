const Kalender = require('../models/Kalender');
// Event erstellen
exports.createEvent = async (req, res) => {
  try {
    const { title, description, startDateTime, endDateTime } = req.body;
    const event = new Kalender({
      title,
      description,
      startDateTime,
      endDateTime
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Fehler beim Erstellen des Events', error: error.message });
  }
};

// Alle Events abrufen
exports.getEvents = async (req, res) => {
  try {
    const events = await Kalender.find({});
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Events', error: error.message });
  }
};

// Einzelnes Event aktualisieren
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDateTime, endDateTime } = req.body;
    const event = await Kalender.findByIdAndUpdate(id, {
      title,
      description,
      startDateTime,
      endDateTime
    }, { new: true }); // { new: true } gibt das aktualisierte Dokument zurück

    if (!event) {
      return res.status(404).json({ message: 'Event nicht gefunden' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren des Events', error: error.message });
  }
};

// Einzelnes Event löschen
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Kalender.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: 'Event nicht gefunden' });
    }

    res.status(200).json({ message: 'Event erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Löschen des Events', error: error.message });
  }
};

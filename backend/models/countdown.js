const Azubi = require('../models/Azubi'); // Pfad zu Ihrem Azubi-Modell
const Ausbilder = require('../models/Ausbilder'); // Pfad zu Ihrem Ausbilder-Modell

  
const getNextBirthday = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    // Suchen Sie nach dem nächsten Geburtstag in beiden Modellen
    const nextBirthdayAzubi = await Azubi.findOne({ birthday: { $gte: today } }).sort({ birthday: 1 }).limit(1);
    const nextBirthdayAusbilder = await Ausbilder.findOne({ birthday: { $gte: today } }).sort({ birthday: 1 }).limit(1);
  
    // Vergleichen Sie, welches Datum näher ist
    if (!nextBirthdayAzubi && !nextBirthdayAusbilder) {
      return null;
    } else if (!nextBirthdayAzubi) {
      return nextBirthdayAusbilder;
    } else if (!nextBirthdayAusbilder) {
      return nextBirthdayAzubi;
    } else {
      return nextBirthdayAzubi.birthday < nextBirthdayAusbilder.birthday ? nextBirthdayAzubi : nextBirthdayAusbilder;
    }
  };
  
  module.exports = getNextBirthday;
// countdownController.js
const Azubi = require('../models/Azubi'); // Pfad zu Ihrem Azubi-Modell
const Ausbilder = require('../models/Ausbilder'); // Pfad zu Ihrem Ausbilder-Modell

function calculateCountdown(targetDate) {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();
  
    if (difference <= 0) {
        // Wenn das Datum in der Vergangenheit liegt, setzen Sie den Countdown auf 0
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
  
    return { days, hours, minutes, seconds };
}

exports.getCountdown = async (req, res) => {
    try {
        let user = await Azubi.findById(req.params.userId);
        if (!user) {
            user = await Ausbilder.findById(req.params.userId);
        }

        if (!user) {
            return res.status(404).send('Benutzer nicht gefunden');
        }

        // Berechnen Sie den Countdown bis zum nächsten Geburtstag
        const currentYear = new Date().getFullYear();
        const userBirthdayThisYear = new Date(user.birthday);
        userBirthdayThisYear.setFullYear(currentYear); // Setzen Sie das Jahr des Geburtstags auf das aktuelle Jahr

        let age = currentYear - user.birthday.getFullYear(); // Grundlegendes Alter berechnen

        if (userBirthdayThisYear < new Date()) {
            // Wenn der Geburtstag dieses Jahr schon vorbei ist, bereiten Sie sich auf das nächste Jahr vor
            userBirthdayThisYear.setFullYear(userBirthdayThisYear.getFullYear() + 1);
            age++; // Erhöhen Sie das Alter, da der Geburtstag im nächsten Jahr sein wird
        }

        const countdown = calculateCountdown(userBirthdayThisYear);
        res.json({ user: user.name, countdown, age });
    } catch (error) {
        console.error(error);
        res.status(500).send('Serverfehler');
    }
};

exports.showNextBirthday = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();

        // Hilfsfunktion, um das Geburtsjahr auf das aktuelle Jahr zu setzen
        const adjustBirthdayYear = (birthday) => {
            const adjustedBirthday = new Date(birthday);
            adjustedBirthday.setFullYear(currentYear);
            return adjustedBirthday;
        };

        // Suchen Sie nach dem nächsten Geburtstag in beiden Modellen
        const azubis = await Azubi.find();
        const ausbilders = await Ausbilder.find();

        const allUsers = [...azubis, ...ausbilders].map(user => {
            user.birthday = adjustBirthdayYear(user.birthday);
            return user;
        });

        const nextBirthdayUser = allUsers
            .filter(user => user.birthday >= today)
            .sort((a, b) => a.birthday - b.birthday)[0];

        if (!nextBirthdayUser) {
            return res.status(404).send({ message: 'Kein kommender Geburtstag gefunden' });
        }

        // Berechnen Sie die verbleibenden Tage und das Alter
        const countdown = calculateCountdown(nextBirthdayUser.birthday);
        const age = currentYear - new Date(nextBirthdayUser.birthday).getFullYear();

        res.json({ user: nextBirthdayUser, countdown, age });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Serverfehler' });
    }
};


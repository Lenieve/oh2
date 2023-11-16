const express = require('express');
const router = express.Router();

const countdownController = require('../controllers/countdownController');


router.get('/countdown/:userId', countdownController.getCountdown);
router.get('/next-birthday', countdownController.showNextBirthday); // Stellen Sie sicher, dass `showNextBirthday` in `userController` definiert ist

module.exports = router;

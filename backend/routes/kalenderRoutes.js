const express = require('express');
const router = express.Router();
const kalenderController = require('../controllers/kalenderController');

router.post('/', kalenderController.createEvent);
router.get('/', kalenderController.getEvents);
router.put('/:id', kalenderController.updateEvent);
router.delete('/:id', kalenderController.deleteEvent);

module.exports = router;

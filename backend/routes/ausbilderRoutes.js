const express = require('express');
const router = express.Router();
const ausbilderController = require('../controllers/ausbilderController');
const { authenticateJWT, authorizeRole } = require('../middlewares/authMiddleware');

router.post('/', ausbilderController.createAusbilder);

router.get('/', ausbilderController.listAusbilder);

router.get('/:id', authenticateJWT, authorizeRole(['Ausbilder']), ausbilderController.getAusbilderById);
router.get('/:id/azubis', authenticateJWT, authorizeRole(['Ausbilder']), ausbilderController.listAzubisByAusbilder);
router.get('/:id/ausbildungs', authenticateJWT, authorizeRole(['Ausbilder']), ausbilderController.listAusbildungsByAusbilder); // New route for listing ausbildungs by ausbilder

router.delete('/:id', authenticateJWT, authorizeRole(['Ausbilder']), ausbilderController.deleteAusbilder);
router.put('/:id', authenticateJWT, authorizeRole(['Ausbilder']), ausbilderController.updateAusbilder);

// Weitere Routen

module.exports = router;


// WunschlisteRoutes.js
const express = require('express');
const router = express.Router();
const wunschlisteController = require('../controllers/wunschlisteController');
const { authenticateJWT, authorizeRole } = require('../middlewares/authMiddleware.js');

router.post('/', authenticateJWT, authorizeRole(['Azubi']), wunschlisteController.createWunschliste);
router.get('/:azubiId',  authenticateJWT, authorizeRole(['Azubi']), wunschlisteController.getWunschlisteByAzubi);
router.put('/:id', authenticateJWT, authorizeRole(['Azubi']),  wunschlisteController.updateWunschliste);
router.delete('/:azubiId',  authenticateJWT, authorizeRole(['Azubi']), wunschlisteController.deleteWunschliste);

module.exports = router;

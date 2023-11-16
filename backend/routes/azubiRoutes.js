const express = require('express');
const router = express.Router();
const azubiController = require('../controllers/azubiController');
const { authenticateJWT, authorizeRole } = require('../middlewares/authMiddleware');


router.post('/', azubiController.createAzubi);
router.get('/listBirthdays',authenticateJWT, authorizeRole(['Ausbilder', 'Azubi']),  azubiController.listBirthdays); // Diese Route zuerst
router.get('/all', authenticateJWT, authorizeRole(['Ausbilder']), azubiController.getAllAzubis);
router.put('/:id',authenticateJWT, authorizeRole(['Azubi']),azubiController.updateAzubi);
router.get('/:id', authenticateJWT, authorizeRole(['Azubi']),azubiController.getAzubiById); // Diese Route danach
router.delete('/:id',  azubiController.deleteAzubi);



module.exports = router;

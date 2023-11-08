const express = require('express');
const router = express.Router();
const ausbildungController = require('../controllers/ausbildungController');
const { authenticateJWT, authorizeRole } = require('../middlewares/authMiddleware');



router.post('/',ausbildungController.createAusbildung);
router.delete('/:id',ausbildungController.deleteAusbildung);
router.get('/:id', ausbildungController.getAusbildungById);
router.put('/:id', ausbildungController.updateAusbildung);
router.get('/:id/azubis', ausbildungController.listAzubisByAusbildung);
router.get('/:id/ausbilder',  ausbildungController.listAusbilderByAusbildung);

module.exports = router;
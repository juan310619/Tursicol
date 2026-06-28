const express = require('express');
const ItineraryController = require('../controllers/itineraryController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyAdmin, ItineraryController.getAllItineraries);
router.post('/', verifyToken, ItineraryController.createItinerary);
router.get('/my', verifyToken, ItineraryController.getMyItineraries);
router.put('/:id', verifyToken, ItineraryController.updateItinerary);
router.delete('/:id', verifyToken, ItineraryController.deleteItinerary);

module.exports = router;

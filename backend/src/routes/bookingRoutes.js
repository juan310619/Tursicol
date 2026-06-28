const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, BookingController.createBooking);
router.get('/my', verifyToken, BookingController.getMyBookings);
router.delete('/:id', verifyToken, BookingController.deleteBooking);

module.exports = router;

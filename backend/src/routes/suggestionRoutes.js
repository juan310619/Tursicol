const express = require('express');
const SuggestionController = require('../controllers/suggestionController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', SuggestionController.getAllSuggestions);
router.post('/', verifyToken, SuggestionController.createSuggestion);
router.put('/:id', verifyAdmin, SuggestionController.updateSuggestion);
router.delete('/:id', verifyAdmin, SuggestionController.deleteSuggestion);

module.exports = router;

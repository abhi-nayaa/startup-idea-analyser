const express = require('express');
const { createIdea, getIdeas, getIdeaById, getIdeaSWOT } = require('../controllers/ideaController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createIdea);
router.get('/', protect, getIdeas);
router.get('/:id/swot', protect, getIdeaSWOT);
router.get('/:id', protect, getIdeaById);

module.exports = router;

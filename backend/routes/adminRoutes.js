const express = require('express');
const {
  createAdminIdea,
  getAdminIdeas,
  getAllUserIdeas,
  triggerAnalysis
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/ideas', protect, adminOnly, createAdminIdea);
router.get('/ideas', protect, adminOnly, getAdminIdeas);
router.get('/user-ideas', protect, adminOnly, getAllUserIdeas);
router.post('/analyse', protect, adminOnly, triggerAnalysis);

module.exports = router;

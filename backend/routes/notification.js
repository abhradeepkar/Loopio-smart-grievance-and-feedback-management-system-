const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, clearAllNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.delete('/', clearAllNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;

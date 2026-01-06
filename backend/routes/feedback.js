const express = require('express');
const router = express.Router();
const {
    getFeedbacks,
    createFeedback,
    updateFeedback,
    addComment,
    deleteFeedback,
    deleteComment,
    getAnalytics
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/analytics', protect, getAnalytics);

router.route('/')
    .get(protect, getFeedbacks)
    .post(protect, upload.single('file'), createFeedback);

router.route('/:id')
    .put(protect, updateFeedback)
    .delete(protect, deleteFeedback);

router.route('/:id/comments')
    .post(protect, addComment);

router.route('/:id/comments/:commentId')
    .delete(protect, deleteComment);

module.exports = router;

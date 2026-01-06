const express = require('express');
const router = express.Router();
const {
    getFeedbacks,
    createFeedback,
    updateFeedback,
    addComment,
    deleteFeedback,
    deleteComment,
    getAnalytics,
    getFeedbackAttachment
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/analytics', protect, getAnalytics);
router.get('/:id/attachment', getFeedbackAttachment); // Public or Protected? Let's make it public for now to ensure <img> tags work easily, or use protect if token is sent with image request (harder for standard <img> tags). 
// The img tag in frontend likely doesn't send headers easily unless we use object URLs. 
// However, the original request was serving static files which were public. So let's keep it public or minimally protected. 
// If it was static 'uploads' folder, it was likely public.
// Let's stick to public for image serving as it's simplest for backward compatibility.

router.route('/')
    .get(protect, getFeedbacks)
    .post(protect, upload.single('file'), createFeedback);

router.route('/:id')
    .put(protect, upload.single('file'), updateFeedback)
    .delete(protect, deleteFeedback);

router.route('/:id/comments')
    .post(protect, addComment);

router.route('/:id/comments/:commentId')
    .delete(protect, deleteComment);

module.exports = router;

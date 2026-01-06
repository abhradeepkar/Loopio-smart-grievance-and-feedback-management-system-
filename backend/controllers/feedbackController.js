const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');
const User = require('../models/User'); // Import User model
const { createNotification } = require('./notificationController');
const path = require('path');

// Helper to transform feedback for response
// Helper to transform feedback for response
const transformFeedback = (feedback) => {
    const feedbackObj = feedback.toObject ? feedback.toObject() : feedback;

    // Check if attachment exists
    if (feedbackObj.attachment) {
        // If it's a string, it's a legacy path or already transformed
        if (typeof feedbackObj.attachment === 'string') {
            return feedbackObj;
        }

        // It's an object (New Schema). 
        // We check for filename OR data because 'data' might be excluded in some queries (like getFeedbacks)
        if (feedbackObj.attachment.filename || feedbackObj.attachment.data) {
            feedbackObj.attachment = `/api/feedbacks/${feedbackObj._id}/attachment`;
        } else {
            // Empty object or invalid state
            feedbackObj.attachment = null;
        }
    } else {
        feedbackObj.attachment = null;
    }
    return feedbackObj;
};

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Private
const getFeedbacks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.category) query.category = req.query.category;
        if (req.query.priority) query.priority = req.query.priority;
        if (req.query.submittedBy) query.submittedBy = req.query.submittedBy;

        // Advanced Search
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // ROLE BASED ACCESS CONTROL
        // If user is not admin/developer, they can only see their own feedbacks
        if (req.user.role === 'user') {
            query.submittedBy = req.user.id;
        } else if (req.query.submittedBy) {
            // Admins/Devs can filter by user
            query.submittedBy = req.query.submittedBy;
        }

        const feedbacks = await Feedback.find(query)
            .select('-attachment.data') // Exclude heavy binary data
            .populate('submittedBy', 'name email profilePicture')
            .populate('assignedTo', 'name email profilePicture')
            .populate({
                path: 'comments.authorId',
                select: 'name profilePicture role'
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Feedback.countDocuments(query);

        // Transform feedbacks to include attachment URL
        const transformedFeedbacks = feedbacks.map(transformFeedback);

        res.status(200).json({
            feedbacks: transformedFeedbacks,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new feedback
// @route   POST /api/feedbacks
// @access  Private
const createFeedback = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;

        if (!title || !description || !category || !priority) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        let attachment = null;
        if (req.file) {
            attachment = {
                filename: req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const feedback = new Feedback({
            title,
            description,
            category,
            priority,
            submittedBy: req.user.id, // Assuming req.user.id is the correct user ID field
            status: 'Submitted',
            attachment // Save file object
        });

        const createdFeedback = await feedback.save();
        console.log('Feedback Created:', createdFeedback._id);

        // Populate author details for immediate UI update
        // Need to re-fetch to exclude binary data if we want to be safe, 
        // or just manually transform. Re-fetching is safer for population.
        const populatedFeedbackData = await Feedback.findById(createdFeedback._id)
            .select('-attachment.data')
            .populate('submittedBy', 'name email profilePicture')
            .populate('assignedTo', 'name email profilePicture')
            .populate({
                path: 'comments.authorId',
                select: 'name profilePicture role'
            });

        const populatedFeedback = transformFeedback(populatedFeedbackData);

        // Real-time Dashboard Update
        if (req.app.get('socketio')) {
            req.app.get('socketio').emit('feedback_added', populatedFeedback);
            req.app.get('socketio').emit('analytics_update');
        } else {
            console.error('Socket.io not found in request app instance');
        }

        // Notify All Admins
        try {
            const admins = await User.find({ role: 'admin' });

            // Notification for ALL Admins: New Feedback
            await Promise.all(admins.map(admin => {
                return createNotification(
                    admin._id,
                    `New feedback submitted: "${title}" by ${req.user.name}`,
                    'info',
                    `/feedbacks/${createdFeedback._id}`,
                    req.app.get('socketio')
                );
            }));

            // Special High Priority Notification for Admins
            if (priority === 'High') {
                await Promise.all(admins.map(admin => {
                    return createNotification(
                        admin._id,
                        `⚠️ HIGH PRIORITY Feedback: "${title}"`,
                        'alert',
                        `/feedbacks/${createdFeedback._id}`,
                        req.app.get('socketio')
                    );
                }));
            }

            // Confirm to User
            await createNotification(
                req.user.id,
                `Feedback "${title}" submitted successfully`,
                'success',
                `/feedbacks/${createdFeedback._id}`,
                req.app.get('socketio')
            );

        } catch (notifyError) {
            console.error('Failed to notify:', notifyError);
        }

        res.status(201).json(populatedFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update feedback status/assignment
// @route   PUT /api/feedbacks/:id
// @access  Private (Dev/Admin)
const updateFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Check Permissions
        // Users can only update their own feedback
        if (req.user.role === 'user' && feedback.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this feedback' });
        }

        const oldStatus = feedback.status;
        const oldAssignedTo = feedback.assignedTo?.toString();

        // Update fields
        if (req.body.title) feedback.title = req.body.title;
        if (req.body.description) feedback.description = req.body.description;
        if (req.body.category) feedback.category = req.body.category;
        if (req.body.priority) feedback.priority = req.body.priority;
        if (req.body.estimatedResolutionDate) feedback.estimatedResolutionDate = req.body.estimatedResolutionDate;

        // Handle File Update
        if (req.file) {
            console.log('Update Feedback: File received:', req.file.originalname);
            feedback.attachment = {
                filename: req.file.originalname,
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        } else {
            console.log('Update Feedback: No file received');
        }

        // Handle Status Update
        if (req.body.status && req.body.status !== oldStatus) {
            console.log('Update Feedback: Status changing to', req.body.status);
            feedback.status = req.body.status;

            // 1. Notify Submitter (User) - ONLY if not the one updating
            if (feedback.submittedBy.toString() !== req.user.id) {
                await createNotification(
                    feedback.submittedBy,
                    `Status updated: "${feedback.title}" is now ${feedback.status}`,
                    'info',
                    `/feedbacks/${feedback._id}`,
                    req.app.get('socketio')
                );
            }

            // 2. Notify Admin (if updated by Developer)
            if (req.user.role === 'developer') {
                const admins = await User.find({ role: 'admin' });
                await Promise.all(admins.map(admin => createNotification(
                    admin._id,
                    `Dev ${req.user.name} updated "${feedback.title}" to ${feedback.status}`,
                    'info',
                    `/feedbacks/${feedback._id}`,
                    req.app.get('socketio')
                )));
            }
            // 3. Notify Developer (if updated by Admin) - e.g Reopened
            if (req.user.role === 'admin' && feedback.assignedTo) {
                await createNotification(
                    feedback.assignedTo,
                    `Admin updated "${feedback.title}" to ${feedback.status}`,
                    'info',
                    `/feedbacks/${feedback._id}`,
                    req.app.get('socketio')
                );
            }
        }

        // Handle Assignment Update
        if (req.body.assignedTo !== undefined && req.body.assignedTo !== oldAssignedTo) {
            feedback.assignedTo = req.body.assignedTo; // Can be null

            if (feedback.assignedTo) {
                // 1. Notify New Developer
                await createNotification(
                    feedback.assignedTo,
                    `You have been assigned to feedback "${feedback.title}"`,
                    'alert',
                    `/feedbacks/${feedback._id}`,
                    req.app.get('socketio')
                );

                // 2. Notify Submitter (User)
                await createNotification(
                    feedback.submittedBy,
                    `Developer assigned to your feedback "${feedback.title}"`,
                    'info',
                    `/feedbacks/${feedback._id}`,
                    req.app.get('socketio')
                );

                // 3. Notify Previous Developer (if applicable) - ONLY if not unassigning self
                if (oldAssignedTo && oldAssignedTo !== req.user.id) {
                    await createNotification(
                        oldAssignedTo,
                        `You were unassigned from "${feedback.title}"`,
                        'warning',
                        `/feedbacks/${feedback._id}`,
                        req.app.get('socketio')
                    );
                }

                // 4. Notify Admins (Confirmation with Dev Name)
                const assignedDeveloper = await User.findById(feedback.assignedTo);
                const devName = assignedDeveloper ? assignedDeveloper.name : 'Developer';

                const admins = await User.find({ role: 'admin' });
                await Promise.all(admins.map(admin => createNotification(
                    admin._id,
                    `Assigned "${feedback.title}" to ${devName}`,
                    'info',
                    `/feedbacks/${feedback._id}`,
                    req.app.get('socketio')
                )));
            } else {
                // CASE: UNASSIGNED / DECLINED
                // 1. Notify Previous Developer (Confirmation)
                if (oldAssignedTo) {
                    await createNotification(
                        oldAssignedTo,
                        `You have unassigned yourself from "${feedback.title}"`,
                        'info',
                        `/feedbacks/${feedback._id}`,
                        req.app.get('socketio')
                    );

                    // 2. Notify Admins (Action Required)
                    const admins = await User.find({ role: 'admin' });
                    // Get name of developer who declined if possible, effectively req.user.name since they triggered it
                    const declinerName = req.user.name || 'Developer';

                    await Promise.all(admins.map(admin => createNotification(
                        admin._id,
                        `⚠️ Task DECLINED: "${feedback.title}" by ${declinerName}`,
                        'alert',
                        `/feedbacks/${feedback._id}`,
                        req.app.get('socketio')
                    )));
                }

                // 3. Notify Submitter (User) - Optional, maybe just keep them in 'Open' loop
                await createNotification(
                    feedback.submittedBy,
                    `Feedback "${feedback.title}" is back to Open status`,
                    'info',
                    `/feedbacks/${feedback._id}`,
                    req.app.get('socketio')
                );
            }
        }

        // Handle Priority Update (specifically to High)
        if (req.body.priority === 'High' && feedback.priority !== 'High') {
            // Notify Developer if assigned
            if (feedback.assignedTo) {
                await createNotification(
                    feedback.assignedTo,
                    `URGENT: Feedback "${feedback.title}" priority set to HIGH`,
                    'alert',
                    `/feedbacks/${feedback._id}`,
                    req.app.get('socketio')
                );
            }
        }


        const updatedFeedback = await feedback.save();
        const populatedFeedbackData = await Feedback.findById(updatedFeedback._id)
            .select('-attachment.data')
            .populate('submittedBy', 'name email profilePicture')
            .populate('assignedTo', 'name email profilePicture')
            .populate({
                path: 'comments.authorId',
                select: 'name profilePicture role'
            });

        const populatedFeedback = transformFeedback(populatedFeedbackData);

        req.app.get('socketio').emit('feedback_updated', populatedFeedback);
        req.app.get('socketio').emit('analytics_update');

        res.status(200).json(populatedFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add comment
// @route   POST /api/feedbacks/:id/comments
// @access  Private
const addComment = async (req, res) => {
    const { text } = req.body;

    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        const comment = {
            text,
            author: req.user.name,
            authorId: req.user.id,
            role: req.user.role
        };

        feedback.comments.push(comment);
        await feedback.save();

        // NOTIFICATION LOGIC
        const commenterId = req.user.id;
        const submitterId = feedback.submittedBy.toString();
        const developerId = feedback.assignedTo ? feedback.assignedTo.toString() : null;

        // Helper to notify a list of users
        const notifyUsers = async (userIds, message) => {
            const uniqueIds = [...new Set(userIds)]; // Avoid duplicates
            await Promise.all(uniqueIds.map(uid => {
                if (uid && uid !== commenterId) { // Don't notify self
                    return createNotification(
                        uid,
                        message,
                        'info',
                        `/feedbacks/${feedback._id}`,
                        req.app.get('socketio')
                    );
                }
                return Promise.resolve();
            }));
        };

        const admins = await User.find({ role: 'admin' });
        const adminIds = admins.map(a => a._id.toString());

        // Logic to determine recipients
        if (req.user.role === 'user') {
            // User commented -> Notify Admin & Developer
            const recipients = [...adminIds];
            if (developerId) recipients.push(developerId);
            await notifyUsers(recipients, `User commented on "${feedback.title}"`);
        } else if (req.user.role === 'admin') {
            // Admin commented -> Notify User & Developer
            const recipients = [submitterId];
            if (developerId) recipients.push(developerId);
            await notifyUsers(recipients, `Admin commented on "${feedback.title}"`);
        } else if (req.user.role === 'developer') {
            // Developer commented -> Notify User & Admin
            await notifyUsers([submitterId, ...adminIds], `Developer commented on "${feedback.title}"`);
        }

        // Re-populate to ensure consistent data structure
        const populatedFeedbackData = await Feedback.findById(req.params.id)
            .select('-attachment.data')
            .populate('submittedBy', 'name email profilePicture')
            .populate('assignedTo', 'name email profilePicture')
            .populate({
                path: 'comments.authorId',
                select: 'name profilePicture role'
            });

        const populatedFeedback = transformFeedback(populatedFeedbackData);

        req.app.get('socketio').emit('feedback_updated', populatedFeedback);

        res.status(200).json(populatedFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private (Owner/Admin)
const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Check if user is owner, admin, or the assigned developer
        const isOwner = feedback.submittedBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const isAssignedDev = req.user.role === 'developer' && feedback.assignedTo && feedback.assignedTo.toString() === req.user.id;

        if (!isOwner && !isAdmin && !isAssignedDev) {
            return res.status(401).json({ message: 'User not authorized to delete this feedback' });
        }

        // No need to unlink local file anymore as it's in DB

        // Notify Submitter if Admin deletes it
        if (req.user.role === 'admin' && feedback.submittedBy.toString() !== req.user.id) {
            await createNotification(
                feedback.submittedBy,
                `Your feedback "${feedback.title}" was removed by Admin`,
                'alert',
                null, // No link since it's deleted
                req.app.get('socketio')
            );
        }

        await feedback.deleteOne();

        req.app.get('socketio').emit('feedback_deleted', req.params.id);
        req.app.get('socketio').emit('analytics_update');

        res.status(200).json({ id: req.params.id, message: 'Feedback deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete comment
// @route   DELETE /api/feedbacks/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Find comment
        const comment = feedback.comments.find(c => c._id.toString() === req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check permission (Author or Admin)
        if (comment.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this comment' });
        }

        // Remove comment
        feedback.comments = feedback.comments.filter(c => c._id.toString() !== req.params.commentId);

        await feedback.save();

        // Re-populate
        const populatedFeedbackData = await Feedback.findById(req.params.id)
            .select('-attachment.data')
            .populate('submittedBy', 'name email profilePicture')
            .populate('assignedTo', 'name email profilePicture')
            .populate({
                path: 'comments.authorId',
                select: 'name profilePicture role'
            });

        const populatedFeedback = transformFeedback(populatedFeedbackData);

        req.app.get('socketio').emit('feedback_updated', populatedFeedback);

        res.status(200).json(populatedFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Feedback Analytics
// @route   GET /api/feedbacks/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        // Define match stage based on user role
        // Define match stage based on user role
        const matchStage = {};
        if (req.user.role === 'user') {
            // Use _id directly from the mongoose document
            matchStage.submittedBy = req.user._id;
        }

        const totalFeedbacks = await Feedback.countDocuments(matchStage);

        const statusCounts = await Feedback.aggregate([
            { $match: matchStage },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const priorityCounts = await Feedback.aggregate([
            { $match: matchStage },
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);

        const categoryCounts = await Feedback.aggregate([
            { $match: matchStage },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Monthly Activity (Last 12 months)
        const monthlyCounts = await Feedback.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $month: "$createdAt" }, // 1-12
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log('getAnalytics Debug:', {
            matchStage,
            totalFeedbacks,
            monthlyCounts
        });

        // Helper to format aggregation result to object
        const formatConfig = (arr) => {
            const acc = {};
            arr.forEach(item => {
                acc[item._id] = item.count;
            });
            return acc;
        };

        // Format monthly data 
        const formatMonthly = (arr) => {
            // Initialize all 12 months to 0
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const result = months.map((m, index) => ({ month: m, value: 0 }));

            arr.forEach(item => {
                // item._id is 1-based month index
                if (item._id >= 1 && item._id <= 12) {
                    result[item._id - 1].value = item.count;
                }
            });
            return result;
        };

        res.status(200).json({
            total: totalFeedbacks,
            status: formatConfig(statusCounts),
            priority: formatConfig(priorityCounts),
            category: formatConfig(categoryCounts),
            monthlyActivity: formatMonthly(monthlyCounts)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get feedback attachment
// @route   GET /api/feedbacks/:id/attachment
// @access  Private (or Public if we want)
const getFeedbackAttachment = async (req, res) => {
    try {
        // We do NOT use .select('-attachment.data') here because we NEED the data
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback || !feedback.attachment || !feedback.attachment.data) {
            return res.status(404).send('No attachment found');
        }

        res.set('Content-Type', feedback.attachment.contentType);
        res.send(feedback.attachment.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getFeedbacks,
    createFeedback,
    updateFeedback,
    addComment,
    deleteFeedback,
    deleteComment,
    getAnalytics,
    getFeedbackAttachment
};

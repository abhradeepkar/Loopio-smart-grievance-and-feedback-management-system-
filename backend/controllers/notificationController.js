const Notification = require('../models/Notification');
// Import Notification model for DB operations

// @desc Get user notifications
// @route GET /api/notifications
// @access Private
const getNotifications = async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.user.id);

        // Find all notifications where recipient = current user
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 }); // Sort by latest first

        console.log('Found notifications:', notifications.length);

        res.status(200).json(notifications);
        // Send notifications back to frontend
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        // Generic error response
    }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res) => {
    try {
        // Find notification by ID from URL params
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            // If no notification found
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if this notification belongs to the logged-in user
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
            // User trying to access others' notification
        }

        // Mark as read
        notification.read = true;
        await notification.save(); // Save updated notification in DB

        res.status(200).json(notification);
        // Send updated notification
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
        // Generic backend error
    }
};

// Internal Helper to create notification
const createNotification = async (recipientId, message, type = 'info', relatedLink = '', io = null) => {
    try {
        // Create and store a new notification
        const notification = await Notification.create({
            recipient: recipientId,  // User who will receive it
            message,                 // Notification text
            type,                    // info/warning/success/error
            relatedLink              // Optional link for navigation
        });

        if (io) {
            // Manually construct payload to avoid Mongoose serialization issues
            const payload = {
                _id: notification._id.toString(),
                recipient: recipientId.toString(),
                message: notification.message,
                type: notification.type,
                relatedLink: notification.relatedLink,
                read: notification.read,
                createdAt: notification.createdAt
            };

            // EMIT TO SPECIFIC USER ROOM ONLY
            io.to(recipientId.toString()).emit('notification_new', payload);
            console.log(`Emitted notification to room: ${recipientId.toString()}`);
        }

        return notification;
    } catch (error) {
        console.error('Notification creation failed:', error);
    }
};

// @desc Clear all notifications
// @route DELETE /api/notifications
// @access Private
const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.status(200).json({ message: 'All notifications cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Test Socket Broadcast
// @route GET /api/notifications/test
// @access Public
const testSocket = async (req, res) => {
    try {
        const io = req.app.get('socketio');
        if (io) {
            const recipient = req.query.recipient;
            const payload = {
                _id: Date.now().toString(),
                recipient: recipient || req.user?.id || 'TEST',
                message: recipient ? 'Private Socket Test' : 'Broadcast Socket Test',
                type: 'info',
                read: false,
                createdAt: new Date()
            };

            if (recipient) {
                console.log(`SOCKET: Emitting to room ${recipient}`);
                io.to(recipient).emit('notification_new', payload);
            } else {
                console.log('SOCKET: Broadcasting to all');
                io.emit('notification_new', payload);
            }

            res.status(200).json({ message: 'Emitted', payload });
        } else {
            res.status(500).json({ message: 'No IO found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getNotifications,  // Export fetch function
    markAsRead,        // Export read update function
    createNotification,// Export create helper
    clearAllNotifications, // Export clear all function
    testSocket // Export test function
};

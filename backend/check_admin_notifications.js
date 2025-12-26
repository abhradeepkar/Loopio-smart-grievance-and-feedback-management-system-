const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback_app');
        console.log('Connected to DB');

        console.log('\n--- ADMIN USERS ---');
        // Check for 'admin', 'Admin', 'ADMIN'
        const users = await User.find({});
        const admins = users.filter(u => u.role.toLowerCase() === 'admin');

        admins.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Role: '${u.role}', Email: ${u.email}`);
        });

        if (admins.length === 0) {
            console.log('WARNING: No users found with role "admin" (case insensitive check)');
        }

        console.log('\n--- LATEST NOTIFICATIONS (Last 5) ---');
        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('recipient', 'name role');

        notifications.forEach(n => {
            console.log(`[${n.createdAt.toISOString()}] To: ${n.recipient?.name} (${n.recipient?.role}) | Msg: "${n.message}"`);
        });

    } catch (error) {
        console.error(error);
    }
    process.exit();
};

check();

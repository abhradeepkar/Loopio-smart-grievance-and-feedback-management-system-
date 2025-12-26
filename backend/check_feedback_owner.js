const mongoose = require('mongoose');
const Feedback = require('./models/Feedback');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkFeedbackOwner = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback_app');
        console.log('Connected to DB');

        // List all users to see who exists
        const users = await User.find({});
        console.log(`\n--- ALL USERS (${users.length}) ---`);
        users.forEach(u => console.log(`- ${u.name} (${u.role}) ID: ${u._id}`));

        // Find all feedbacks without limit to ensure we don't miss "code issue"
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).populate('submittedBy');

        if (feedbacks.length > 0) {
            console.log(`\n--- ALL FEEDBACKS (${feedbacks.length}) ---`);
            feedbacks.forEach(fb => {
                const submitter = fb.submittedBy ? `${fb.submittedBy.name} (${fb.submittedBy.role}) [ID: ${fb.submittedBy._id}]` : 'Unknown/Deleted User';
                console.log(`Title: "${fb.title}" | Status: ${fb.status} | ID: ${fb._id}`);
                console.log(`Submitted By: ${submitter}\n`);
            });
        } else {
            console.log('No feedbacks found.');
        }

        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('--- CURRENT ADMIN ---');
            console.log(`Name: ${admin.name} | ID: ${admin._id}`);
        }

        // Wait to ensure logs are flushed safely
        setTimeout(() => {
            try {
                mongoose.disconnect();
            } catch (e) {
                console.error(e);
            }
            process.exit(0);
        }, 3000);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkFeedbackOwner();

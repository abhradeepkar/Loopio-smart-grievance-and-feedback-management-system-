const mongoose = require('mongoose');
const User = require('./backend/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback_app');
        console.log('Connected to DB');

        const admins = await User.find({ role: 'admin' });
        console.log(`Found ${admins.length} admins.`);
        admins.forEach(a => console.log(`- ${a.name} (${a.email}) ID: ${a._id}`));

        const allUsers = await User.find({});
        console.log(`Total users: ${allUsers.length}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAdmins();

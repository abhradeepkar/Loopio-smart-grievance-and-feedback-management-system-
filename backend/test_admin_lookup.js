const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testAdminLookup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback_app');
        console.log('Connected to DB');

        const admins = await User.find({ role: 'admin' });
        console.log(`Found ${admins.length} admins.`);
        admins.forEach(a => console.log(`- ${a.name} (${a.email}) ID: ${a._id}`));

        if (admins.length > 0) {
            console.log('Admin lookup WORKS.');
        } else {
            console.log('Admin lookup FAILED (No admins found).');
        }

    } catch (error) {
        console.error(error);
    }
    process.exit();
};

testAdminLookup();

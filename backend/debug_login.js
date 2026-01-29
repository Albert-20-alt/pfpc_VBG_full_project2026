const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function debugLogin() {
    try {
        console.log("Checking database connection...");
        await sequelize.authenticate();
        console.log("Database connected.");

        const username = 'superAdmin';
        const password = 'password123';

        console.log(`Searching for user: "${username}"...`);
        const user = await User.findOne({ where: { username } });

        if (!user) {
            console.log("❌ User NOT FOUND.");
            // List all users to see what's there
            const allUsers = await User.findAll({ attributes: ['username'] });
            console.log("Existing users:", allUsers.map(u => u.username));
        } else {
            console.log("✅ User FOUND.");
            console.log(`Role: ${user.role}`);
            console.log(`Stored Password Hash: ${user.password.substring(0, 10)}...`);

            console.log(`Testing password "${password}"...`);
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                console.log("✅ Password MATCHES! Login should work.");
            } else {
                console.log("❌ Password DOES NOT MATCH.");
            }
        }

    } catch (error) {
        console.error("Error during debug:", error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

debugLogin();

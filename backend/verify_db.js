const path = require('path');
// Load .env from the same directory as this script (backend/.env)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sequelize = require('./config/database');
const Case = require('./models/Case');
const User = require('./models/User');

async function verifyDatabase() {
    try {
        console.log('Testing Database Connection...');
        console.log(`Using Config: Host=${process.env.DB_HOST}, User=${process.env.DB_USER}, DB=${process.env.DB_NAME}`);

        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');

        // Check Users
        const userCount = await User.count();
        console.log(`\n📊 Total Users: ${userCount}`);

        if (userCount > 0) {
            // Fetch one user to verify data integrity
            const firstUser = await User.findOne();
            console.log('   Sample User:', JSON.stringify({
                id: firstUser.id,
                role: firstUser.role,
                region: firstUser.region,
                email: firstUser.email
            }, null, 2));
        } else {
            console.log('   ⚠️ No users found.');
        }

        // Check Cases
        const caseCount = await Case.count();
        console.log(`\n📊 Total Cases: ${caseCount}`);

        if (caseCount > 0) {
            const firstCase = await Case.findOne();
            console.log('   Sample Case:', JSON.stringify({
                id: firstCase.id,
                victimRegion: firstCase.victimRegion,
                agentId: firstCase.agentId,
                status: firstCase.status
            }, null, 2));
        } else {
            console.log('   ⚠️ No cases found.');
        }

    } catch (error) {
        console.error('❌ Database Error:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

verifyDatabase();

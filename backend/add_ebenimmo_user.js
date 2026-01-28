const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./models/User');
const sequelize = require('./config/database');

async function createSpecificUser() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL via Sequelize');

        // Sync models (optional, but good to ensure table exists)
        await sequelize.sync();

        const email = 'admin@ebenimmo.sn';
        const password = 'password123';
        const role = 'admin'; // Assume admin role for this user
        const name = 'Admin EbenImmo';
        const region = 'Ziguinchor';

        const exists = await User.findOne({ where: { email } });
        if (exists) {
            console.log(`User ${email} already exists. Updating password...`);
            const hashedPassword = await bcrypt.hash(password, 10);
            await exists.update({
                password: hashedPassword,
                role,
                name,
                region
            });
            console.log(`User ${email} updated.`);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                email,
                password: hashedPassword,
                role,
                name,
                region
            });
            console.log(`User created: ${email}`);
        }

        const finalUser = await User.findOne({ where: { email } });
        console.log(`Final user check - Email: ${finalUser.email}, Role: ${finalUser.role}, Region: ${finalUser.region}`);

    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await sequelize.close();
        console.log('Disconnected from MySQL');
    }
}

createSpecificUser();

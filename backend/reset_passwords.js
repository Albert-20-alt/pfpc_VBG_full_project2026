const dotenv = require('dotenv');
dotenv.config();
const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function resetPasswords() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const hashedPassword = await bcrypt.hash('password123', 10);
        const usersToReset = [
            { email: 'admin@pfpc.sn', name: 'Super Admin', role: 'super-admin', region: 'Dakar' },
            { email: 'agent.zig@pfpc.com', name: 'Moussa Diop', role: 'agent', region: 'Ziguinchor' },
            { email: 'admin.zig@pfpc.com', name: 'Admin Ziguinchor', role: 'admin', region: 'Ziguinchor' }
        ];

        for (const u of usersToReset) {
            const [updated] = await User.update(
                { password: hashedPassword },
                { where: { email: u.email } }
            );

            if (updated > 0) {
                console.log(`Password reset for ${u.email}`);
            } else {
                console.log(`User ${u.email} not found. Creating...`);
                await User.create({
                    name: u.name,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role,
                    region: u.region
                });
                console.log(`Created ${u.email}`);
            }
        }

    } catch (error) {
        console.error('Error resetting passwords:', error);
    } finally {
        await sequelize.close();
    }
}

resetPasswords();

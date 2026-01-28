const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const fixAgent = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const email = 'agent.zig@pfpc.com';
        const targetUsername = 'agentZig';

        // Find by email
        let user = await User.findOne({ where: { email } });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        if (user) {
            console.log(`Found user by email: ${user.id}`);
            // Update
            user.username = targetUsername;
            user.password = hashedPassword;
            try {
                await user.save();
                console.log('Agent updated successfully with username and password.');
            } catch (e) {
                console.error('Update failed:', e.message);
                // Fallback: if username taken, maybe THIS user already has it?
                if (e.name === 'SequelizeUniqueConstraintError') {
                    console.log('Username already taken. Checking if it matches...');
                    const u2 = await User.findOne({ where: { username: targetUsername } });
                    if (u2) {
                        console.log(`User with username ${targetUsername} exists (ID: ${u2.id}). Updating PW.`);
                        u2.password = hashedPassword;
                        u2.email = email; // Ensure email matches
                        await u2.save();
                        console.log('Agent fixed via username match.');
                    }
                }
            }
        } else {
            console.log('User not found by email. looking by username...');
            user = await User.findOne({ where: { username: targetUsername } });
            if (user) {
                console.log(`Found user by username: ${user.id}. Updating email...`);
                user.email = email;
                user.password = hashedPassword;
                await user.save();
                console.log('Agent updated.');
            } else {
                console.log('User completely missing. Creating...');
                await User.create({
                    name: 'Moussa Diop (Agent Zig)',
                    username: targetUsername,
                    email: email,
                    password: hashedPassword,
                    role: 'agent',
                    region: 'Ziguinchor',
                    department: 'Ziguinchor',
                    commune: 'Ziguinchor',
                    phone: '774445566'
                });
                console.log('Agent created.');
            }
        }
        process.exit(0);

    } catch (error) {
        console.error('Critical Error:', error);
        process.exit(1);
    }
};

fixAgent();

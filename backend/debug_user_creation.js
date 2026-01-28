const sequelize = require('./config/database');
const User = require('./models/User');

async function testUserCreation() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const testUsername = 'testuser_' + Date.now();
        const testEmail = testUsername + '@example.com';

        console.log('Creating user:', testUsername);

        const newUser = await User.create({
            name: 'Test User',
            username: testUsername,
            email: testEmail,
            role: 'agent',
            password: 'password123', // In real app this is hashed, but model doesn't enforce hash logic, route does.
            // We just test persistence here.
            region: 'Dakar'
        });

        console.log('User created with ID:', newUser.id);

        const foundUser = await User.findOne({ where: { username: testUsername } });
        if (foundUser) {
            console.log('SUCCESS: User found in DB:', foundUser.username);
        } else {
            console.error('FAILURE: User NOT found in DB after creation!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

testUserCreation();

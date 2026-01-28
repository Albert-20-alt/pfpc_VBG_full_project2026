require('dotenv').config();
const sequelize = require('./config/database');
const User = require('./models/User');

async function findAgent() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll({
            where: {
                region: 'Ziguinchor',
                role: 'agent'
            }
        });

        if (users.length > 0) {
            console.log("FOUND_AGENTS:" + JSON.stringify(users, null, 2));
        } else {
            console.log("NO_AGENTS_FOUND");
            // Create one if missing
            const newAgent = await User.create({
                name: "Agent Ziguinchor Test",
                email: "agent.zig@test.com",
                password: "password123", // In real app, hash this
                role: "agent",
                region: "Ziguinchor"
            });
            console.log("CREATED_AGENT:" + JSON.stringify(newAgent, null, 2));
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findAgent();

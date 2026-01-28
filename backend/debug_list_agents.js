const { Sequelize, Op } = require('sequelize');
require('dotenv').config();
const User = require('./models/User');

const sequelize = require('./config/database');

async function listUsers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // List all users in Tambacounda
        const tambaUsers = await User.findAll({
            where: {
                region: { [Op.like]: '%Tambacounda%' }
            }
        });

        console.log(`\nFound ${tambaUsers.length} users with region like 'Tambacounda':`);
        tambaUsers.forEach(u => {
            console.log(`- ${u.username} | Role: ${u.role} | Region: '${u.region}' | Status: '${u.status}' | Email: ${u.email}`);
        });

        // Check if there are agents with NULL region or different case
        const allAgents = await User.findAll({ where: { role: 'agent' } });
        console.log(`\nCheck for case mismatch details:`);
        allAgents.forEach(a => {
            console.log(`- Agent: ${a.username}, Region: '${a.region}'`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

listUsers();

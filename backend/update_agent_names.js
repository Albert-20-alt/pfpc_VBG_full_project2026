const sequelize = require('./config/database');
const Case = require('./models/Case');

async function updateAgentNames() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established.');

        console.log('Updating agent names...');

        // Update all cases to have a realistic agent name if it's missing or generic
        // In a real app, we would join with Users table, but here we might just simulate it
        // or set a default "Moussa Diop" for demo purposes as requested.

        await sequelize.query(`UPDATE Cases SET agentName = 'Moussa Diop' WHERE agentName IS NULL OR agentName = ''`);

        // Also update the specific "Agent 2" if that's what's showing up
        // Assuming "Agent 2" is the ID, and name was null, so it showed "Agent 2" (from ID fallback).
        // If ID is 2, set name to "Fatou Ndiaye"
        await sequelize.query(`UPDATE Cases SET agentName = 'Fatou Ndiaye' WHERE agentId = '2'`);
        await sequelize.query(`UPDATE Cases SET agentName = 'Moussa Diop' WHERE agentId = '1'`);

        console.log('Successfully updated agent names.');

        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateAgentNames();

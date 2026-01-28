const sequelize = require('./config/database');
const Resource = require('./models/Resource');

async function syncSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync Resources table to add new columns
        await Resource.sync({ alter: true });
        console.log('Resource table updated.');

    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await sequelize.close();
    }
}

syncSchema();

const sequelize = require('./config/database');
const Case = require('./models/Case');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        const count = await Case.count();
        console.log(`Total cases in DB: ${count}`);
        const cases = await Case.findAll({ limit: 1 });
        console.log('Sample case:', JSON.stringify(cases[0], null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

testConnection();

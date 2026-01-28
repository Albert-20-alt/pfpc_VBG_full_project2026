const sequelize = require('./config/database');
const Case = require('./models/Case');

async function anonymizeData() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established.');

        console.log('Anonymizing sensitive data...');

        // Using raw query for direct update, or model update
        // Since we are about to remove the fields from the model, let's use a raw query
        // to ensure we hit the columns even if the model definition changes later.
        // However, assumes columns exist.

        await sequelize.query('UPDATE Cases SET victimName = NULL, perpetratorName = NULL');

        console.log('Successfully anonymized all cases. Victim and Perpetrator names are now NULL.');

        process.exit(0);
    } catch (error) {
        console.error('Anonymization failed:', error);
        process.exit(1);
    }
}

anonymizeData();

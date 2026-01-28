const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize
const sequelize = new Sequelize('pfpc_vbg', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    port: 8889
});

// Define ContactInfo model (simplified for test)
const ContactInfo = sequelize.define('ContactInfo', {
    address: { type: DataTypes.STRING, defaultValue: 'Default Address' },
    email: { type: DataTypes.STRING, defaultValue: 'default@email.com' },
    phone: { type: DataTypes.STRING, defaultValue: '+000000000' }
}, {
    timestamps: true
});

async function verifyContactInfo() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync model (ensure table exists)
        await ContactInfo.sync();

        // 1. Create default if not exists (simulate GET logic)
        let info = await ContactInfo.findOne();
        if (!info) {
            console.log('Creating default contact info...');
            info = await ContactInfo.create({});
        } else {
            console.log('Found existing contact info:', info.toJSON());
        }

        // 2. Simulate PUT (Update)
        const newAddress = `New Address ${Date.now()}`;
        console.log(`Updating address to: ${newAddress}`);

        info.address = newAddress;
        info.email = `updated-${Date.now()}@test.com`;
        info.phone = '+221 77 000 00 00';

        await info.save();
        console.log('Update successful.');

        // 3. Verify Persistence
        const reFetch = await ContactInfo.findByPk(info.id);
        console.log('Refetched info:', reFetch.toJSON());

        if (reFetch.address === newAddress) {
            console.log('VERIFICATION SUCCESS: Contact info updated and persisted.');
        } else {
            console.error('VERIFICATION FAILED: Address mismatch.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Verification Error:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

verifyContactInfo();

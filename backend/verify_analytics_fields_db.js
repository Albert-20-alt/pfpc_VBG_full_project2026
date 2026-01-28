const Case = require('./models/Case');
const sequelize = require('./config/database');

// Force sync to ensure validation doesn't fail on missing tables if any (though server is running)
// We won't alter, just authenticate.
async function verifyAnalyticsFields() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // 1. Create a Test Case with distinctive Analytics Data
        const uniqueId = `TEST_ANALYTICS_${Date.now()}`;
        const testCaseData = {
            victimName: uniqueId,
            victimAge: '25',
            victimGender: 'Femme',

            // New Analytics Fields
            relationshipToVictim: 'Voisin',
            victimMaritalStatus: 'Célibataire',
            incidentLocation: 'Domicile',
            victimDisability: 'Moteur',
            victimEducation: 'Universitaire',

            incidentDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            createdAt: new Date(),

            status: 'pending',
            victimRegion: 'Dakar'
        };

        console.log('Creating Test Case with analytics data...');
        const createdCase = await Case.create(testCaseData);
        console.log(`Created Case ID: ${createdCase.id}`);

        // 2. Fetch it back to ensure fields were saved
        console.log('Fetching case back from DB...');
        const fetchedCase = await Case.findByPk(createdCase.id);

        if (!fetchedCase) {
            throw new Error('Failed to fetch the created case.');
        }

        // 3. Verify Fields
        const checks = [
            { field: 'relationshipToVictim', expected: 'Voisin' },
            { field: 'victimMaritalStatus', expected: 'Célibataire' },
            { field: 'incidentLocation', expected: 'Domicile' },
            { field: 'victimDisability', expected: 'Moteur' },
            { field: 'victimEducation', expected: 'Universitaire' }
        ];

        let allPass = true;
        checks.forEach(check => {
            const actual = fetchedCase[check.field];
            if (actual === check.expected) {
                console.log(`✅ ${check.field}: Matches (${actual})`);
            } else {
                console.error(`❌ ${check.field}: Expected '${check.expected}', got '${actual}'`);
                allPass = false;
            }
        });

        // 4. Clean up
        console.log('Cleaning up test case...');
        await fetchedCase.destroy();
        console.log('Test case deleted.');

        if (allPass) {
            console.log('\nSUCCESS: All analytics fields are correctly connected to the database.');
            process.exit(0);
        } else {
            console.error('\nFAILURE: Some fields did not persist correctly.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Test execution failed:', error);
        process.exit(1);
    }
}

verifyAnalyticsFields();

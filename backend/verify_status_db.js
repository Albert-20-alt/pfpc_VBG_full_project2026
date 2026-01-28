const { Sequelize } = require('sequelize');
require('dotenv').config();
const Case = require('./models/Case');
const sequelize = require('./config/database');

async function verifyStatusUpdate() {
    console.log("1. Connecting to Database...");
    try {
        await sequelize.authenticate();
        console.log("   ✅ Connected to MySQL.");
    } catch (error) {
        console.error("   ❌ Connection failed:", error.message);
        return;
    }

    let testCaseId = null;

    try {
        console.log("\n2. Creating a TEST case with status 'pending'...");
        const newCase = await Case.create({
            victimName: "Test Validation User",
            victimRegion: "Dakar",
            status: "pending",
            agentName: "System Verifier"
        });
        testCaseId = newCase.id;
        console.log(`   ✅ Case created. ID: ${testCaseId}, Status: ${newCase.status}`);

        console.log("\n3. Updating status to 'completed' (Simulating 'Valider')...");
        // Simulate what the route does: update passing the new body
        // const [updated] = await Case.update({ status: 'completed' }, { where: { id: testCaseId }}); -- Route uses instance update now
        const caseToUpdate = await Case.findByPk(testCaseId);
        await caseToUpdate.update({ status: 'completed' });

        console.log("   ✅ Update command executed.");

        console.log("\n4. Verifying persistence in Database...");
        const verifiedCase = await Case.findByPk(testCaseId);
        console.log(`   Current Status in DB: ${verifiedCase.status}`);

        if (verifiedCase.status === 'completed') {
            console.log("   🎉 SUCCESS: Database correctly updated status to 'completed'.");
        } else {
            console.error("   ❌ FAILURE: Status did not update correctly.");
        }

    } catch (error) {
        console.error("   ❌ Error during verification:", error);
    } finally {
        if (testCaseId) {
            console.log("\n5. Cleaning up (Deleting test case)...");
            await Case.destroy({ where: { id: testCaseId } });
            console.log("   ✅ Test case deleted.");
        }
        await sequelize.close();
    }
}

verifyStatusUpdate();

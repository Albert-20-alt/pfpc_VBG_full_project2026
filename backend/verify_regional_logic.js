const { Sequelize, Op } = require('sequelize');
require('dotenv').config();
const Case = require('./models/Case');
const User = require('./models/User');
const sequelize = require('./config/database');

async function verifyRegionalLogic() {
    console.log("1. Connecting to Database...");
    try {
        await sequelize.authenticate();
        console.log("   ✅ Connected.");
    } catch (e) {
        console.error("Connection failed:", e);
        return;
    }

    try {
        // 1. Get or Create Admin Ziguinchor
        let adminUser = await User.findOne({ where: { email: 'admin.zig@pfpc.com' } });
        if (!adminUser) {
            console.log("   Creating test admin...");
            adminUser = await User.create({
                name: "Admin Zig Test",
                username: "admin_zig_test",
                email: "admin.zig@pfpc.com",
                password: "hashed_dummy",
                role: "admin",
                region: "Ziguinchor"
            });
        }
        console.log(`   👤 User Context: ${adminUser.name} (ID: ${adminUser.id}), Region: ${adminUser.region}`);

        // 2. Create Test Cases
        console.log("\n2. Creating Test Cases...");

        // Case A: Created by Admin, but Victim Region is different (e.g., they traveled)
        // Should be VISIBLE because AgentId matches
        const caseA = await Case.create({
            victimName: "Test Case A (My Case, Diff Region)",
            victimRegion: "Dakar", // Different region
            agentId: adminUser.id,
            agentName: adminUser.name,
            status: "pending"
        });

        // Case B: Created by someone else, but in Ziguinchor
        // Should be VISIBLE because Region matches
        const caseB = await Case.create({
            victimName: "Test Case B (Other Agent, My Region)",
            victimRegion: "Ziguinchor", // Same region
            agentId: 9999,
            agentName: "Other Agent",
            status: "pending"
        });

        // Case C: Created by someone else, in Kolda
        // Should NOT be visible
        const caseC = await Case.create({
            victimName: "Test Case C (Other Agent, Other Region)",
            victimRegion: "Kolda",
            agentId: 9999,
            agentName: "Other Agent",
            status: "pending"
        });

        console.log("   ✅ Cases Created.");

        // 3. Simulate Frontend Filter Logic
        console.log("\n3. Testing Logic...");
        const allCases = [caseA, caseB, caseC]; // Simulate fetching 'all cases' (or subset)

        const visibleCases = allCases.filter(c =>
            String(c.agentId) === String(adminUser.id) ||
            c.victimRegion === adminUser.region ||
            c.perpetratorRegion === adminUser.region
        );

        console.log(`   Cases Visible: ${visibleCases.length} / 3`);

        const seesCaseA = visibleCases.find(c => c.id === caseA.id);
        const seesCaseB = visibleCases.find(c => c.id === caseB.id);
        const seesCaseC = visibleCases.find(c => c.id === caseC.id);

        let success = true;

        if (seesCaseA) {
            console.log("   ✅ [PASS] Case A (My Case) is visible.");
        } else {
            console.error("   ❌ [FAIL] Case A (My Case) is HIDDEN!");
            success = false;
        }

        if (seesCaseB) {
            console.log("   ✅ [PASS] Case B (Regional Case) is visible.");
        } else {
            console.error("   ❌ [FAIL] Case B (Regional Case) is HIDDEN!");
            success = false;
        }

        if (!seesCaseC) {
            console.log("   ✅ [PASS] Case C (Other Region) is correctly hidden.");
        } else {
            console.error("   ❌ [FAIL] Case C (Other Region) is VISIBLE!");
            success = false;
        }

        // Cleanup
        console.log("\n4. Cleaning up...");
        await Case.destroy({ where: { id: [caseA.id, caseB.id, caseC.id] } });
        console.log("   ✅ Cleanup done.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
}

verifyRegionalLogic();

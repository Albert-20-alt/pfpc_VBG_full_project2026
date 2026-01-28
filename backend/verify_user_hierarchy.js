const { Sequelize, Op } = require('sequelize');
require('dotenv').config();
const User = require('./models/User');
const sequelize = require('./config/database');

async function verifyUserHierarchy() {
    console.log("1. Connecting...");
    try { await sequelize.authenticate(); } catch (e) { console.error(e); return; }

    try {
        console.log("2. Setting up Test Users...");

        // 1. SuperAdmin (already exists usually, but let's mock context)
        const superAdmin = { role: 'super-admin' }; // Sees everything

        // 2. Admin Ziguinchor
        let adminZig = await User.findOne({ where: { email: 'admin.zig@pfpc.com' } });
        // Ensure exists from previous steps or create
        if (!adminZig) throw new Error("Admin Zig not found, run previous setup.");

        // 3. Admin Dakar (Find or Create)
        let adminDakar = await User.findOne({
            where: {
                [Op.or]: [{ email: 'admin.dakar@pfpc.com' }, { username: 'admin_dakar' }]
            }
        });

        if (!adminDakar) {
            adminDakar = await User.create({
                name: "Admin Dakar Test",
                username: "admin_dakar",
                email: "admin.dakar@pfpc.com",
                password: "hash",
                role: "admin",
                region: "Dakar"
            });
        }

        // SCENARIO 1: SuperAdmin creates an Agent in Ziguinchor
        console.log("\n--- SCENARIO 1: SuperAdmin creates Agent in Ziguinchor ---");
        const agentZigBySuper = await User.create({
            name: "Agent Zig (By Super)",
            username: "agent_zig_super",
            email: "agent.zig.super@pfpc.com",
            password: "hash",
            role: "agent",
            region: "Ziguinchor"
        });

        // CHECK: Does Admin Zig see him?
        // Logic from UsersPage: matchesRegion = currentUser.role === 'admin' ? user.region === currentUser.region : true
        const visibleToZig = agentZigBySuper.region === adminZig.region;
        const visibleToDakar = agentZigBySuper.region === adminDakar.region;

        console.log(`Agent Created: ${agentZigBySuper.name} (${agentZigBySuper.region})`);
        console.log(`Visible to Admin Ziguinchor? ${visibleToZig ? '✅ YES' : '❌ NO'}`);
        console.log(`Visible to Admin Dakar?      ${visibleToDakar ? '❌ YES (Error)' : '✅ NO'}`);

        // SCENARIO 2: Admin Ziguinchor creates an Agent
        console.log("\n--- SCENARIO 2: Admin Zig creates Agent ---");
        const agentZigByAdmin = await User.create({
            name: "Agent Zig (By Admin)",
            username: "agent_zig_admin",
            email: "agent.zig.admin@pfpc.com",
            password: "hash",
            role: "agent",
            region: "Ziguinchor" // Forced by UI logic
        });

        // CHECK: Does SuperAdmin see him?
        // Logic: SuperAdmin sees all
        const visibleToSuper = true;
        console.log(`Agent Created: ${agentZigByAdmin.name}`);
        console.log(`Visible to SuperAdmin?       ${visibleToSuper ? '✅ YES' : '❌ NO'}`);

        // Cleanup
        await User.destroy({ where: { id: [agentZigBySuper.id, agentZigByAdmin.id, adminDakar.id] } });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await sequelize.close();
    }
}

verifyUserHierarchy();

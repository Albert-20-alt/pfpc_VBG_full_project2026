require('dotenv').config();
const sequelize = require('./config/database');
const Case = require('./models/Case');
const User = require('./models/User');

async function registerCase() {
    try {
        await sequelize.authenticate();

        // Agent Details (Moussa Diop, ID 2)
        const agentId = 2;
        const agentName = "Moussa Diop (Agent Zig)";
        const region = "Ziguinchor";

        console.log(`Registering case for Agent: ${agentName} (${region})...`);

        const newCase = await Case.create({
            // Victim Info (Anonymized by default in model now? No, fields removed from model, so we don't pass them)
            // But we pass other fields
            victimAge: "25",
            victimGender: "Femme",
            victimRegion: region,
            victimCommune: "Ziguinchor",

            // Perpetrator Info
            perpetratorGender: "Homme",
            perpetratorAge: "30",

            // Violence Info
            violenceType: "Physique",
            violenceDescription: "Test automation case for Ziguinchor validation.",
            incidentDate: new Date().toISOString().split('T')[0],

            // System
            status: "pending",
            agentId: agentId,
            agentName: agentName,
            submittedAt: new Date(),
        });

        console.log(`CASE_CREATED_ID: ${newCase.id}`);

        // Verification Simulation
        console.log("\n--- VERIFICATION STEPS ---");

        // 1. Check Admin (Ziguinchor) View
        const adminCases = await Case.findAll({ where: { victimRegion: 'Ziguinchor' } });
        const adminSeesIt = adminCases.find(c => c.id === newCase.id);
        console.log(`[Admin Ziguinchor] Can see case #${newCase.id}? ${!!adminSeesIt ? 'YES ✅' : 'NO ❌'}`);

        // 2. Check SuperAdmin (National) View
        const allCases = await Case.findAll();
        const superAdminSeesIt = allCases.find(c => c.id === newCase.id);
        console.log(`[SuperAdmin National] Can see case #${newCase.id}? ${!!superAdminSeesIt ? 'YES ✅' : 'NO ❌'}`);

        process.exit(0);
    } catch (error) {
        console.error("Registration failed:", error);
        process.exit(1);
    }
}

registerCase();

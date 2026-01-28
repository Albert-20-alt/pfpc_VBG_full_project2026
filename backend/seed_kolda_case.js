require('dotenv').config();
const sequelize = require('./config/database');
const Case = require('./models/Case');
const User = require('./models/User');

const seedKolda = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Find Kolda Admin to assign (or just assign to null/temp if robust, but better to have an agent)
        // Actually, let's just create it.

        console.log('Seeding Kolda Case...');

        // We need an agent in Kolda or just a case in Kolda. 
        // RBAC usually filters by case.region OR user.region.
        // If the Admin is Kolda, they see Kolda cases.
        // If the Admin is Ziguinchor, they should NOT see Kolda cases.

        const koldaCase = {
            victimName: "Kolda Victim Test",
            victimAge: "40",
            victimGender: "F",
            violenceType: "Economique",
            victimRegion: "Kolda", // Vital for RBAC check
            status: "pending",
            incidentDate: "2024-01-20"
            // agentId is optional or can be null if not assigned yet
        };

        const created = await Case.create(koldaCase);
        console.log(`Created Kolda case: ${created.id}`);

        const agentBig = await User.findOne({ where: { email: 'agent.bignona@pfpc.sn' } });
        if (agentBig) {
            const bigCase = {
                victimName: "Bignona Victim Test",
                victimAge: "30",
                victimGender: "F",
                violenceType: "Physique",
                victimRegion: "Ziguinchor",
                agentId: agentBig.id,
                status: "open",
                incidentDate: "2024-01-22"
            };
            const createdBig = await Case.create(bigCase);
            console.log(`Created Bignona Agent case: ${createdBig.id}`);
        } else {
            console.log("Agent Bignona not found. Skipping.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedKolda();

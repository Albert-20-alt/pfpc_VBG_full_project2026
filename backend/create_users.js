const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const createUsers = async () => {
  try {
    // alter: true updates the schema without dropping data (adds phone column if missing)
    await sequelize.sync({ alter: true });
    console.log('Base de données synchronisée.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Super Admin',
        username: 'superAdmin',
        email: 'admin@pfpc.sn',
        password: hashedPassword,
        role: 'super-admin',
        region: 'Dakar',
        phone: '770000001'
      },
      {
        name: 'Admin Ziguinchor',
        username: 'adminZig',
        email: 'admin.zig@pfpc.sn',
        password: hashedPassword,
        role: 'admin',
        region: 'Ziguinchor',
        phone: '770000002'
      },
      {
        name: 'Admin Koldaaa',
        username: 'adminKolda',
        email: 'admin.kolda@pfpc.sn',
        password: hashedPassword,
        role: 'admin',
        region: 'Kolda',
        phone: '770000003'
      },
      {
        name: 'Aissatou Diallo (Agent Big)',
        username: 'agentBignona',
        email: 'agent.bignona@pfpc.sn',
        password: hashedPassword,
        role: 'agent',
        region: 'Ziguinchor',
        department: 'Bignona',
        commune: 'Tenghory',
        phone: '771112233'
      },
      {
        name: 'Moussa Diop (Agent Zig)',
        username: 'agentZig',
        email: 'agent.zig@pfpc.com',
        password: hashedPassword,
        role: 'agent',
        region: 'Ziguinchor',
        department: 'Ziguinchor',
        commune: 'Ziguinchor',
        phone: '774445566'
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        // Update existing user (important for adding phone numbers to existing accounts)
        await existingUser.update(userData);
        console.log(`Utilisateur mis à jour: ${userData.email}`);
      } else {
        // Create new user if not exists
        await User.create(userData);
        console.log(`Utilisateur créé: ${userData.email}`);
      }
    }

    // --- Seed Cases for Analytics ---
    const Case = require('./models/Case');

    // Find the Ziguinchor Agent to assign cases to
    const agentZig = await User.findOne({ where: { email: 'agent.zig@pfpc.com' } });

    if (agentZig) {
      console.log('Creation des cas pour l\'agent Ziguinchor...');
      const cases = [
        {
          victimName: "Fatou Diop",
          victimAge: "25",
          victimGender: "F",
          violenceType: "Physique",
          victimRegion: "Ziguinchor",
          agentId: agentZig.id,
          status: "pending",
          incidentDate: "2023-10-15"
        },
        {
          victimName: "Aminata Sow",
          victimAge: "30",
          victimGender: "F",
          violenceType: "Psychologique",
          victimRegion: "Ziguinchor",
          agentId: agentZig.id,
          status: "completed",
          incidentDate: "2023-09-10"
        },
        {
          victimName: "Codou Ndiaye",
          victimAge: "19",
          victimGender: "F",
          violenceType: "Sexuelle",
          victimRegion: "Ziguinchor",
          agentId: agentZig.id,
          status: "pending",
          incidentDate: "2023-11-20"
        },
        {
          victimName: "Ousmane Fall",
          victimAge: "12",
          victimGender: "M",
          violenceType: "Négligence",
          victimRegion: "Ziguinchor",
          agentId: agentZig.id,
          status: "completed",
          incidentDate: "2024-01-05"
        }
      ];

      for (const caseData of cases) {
        // Check existence by victim name + date to avoid dupes on re-run
        const exists = await Case.findOne({
          where: {
            victimName: caseData.victimName,
            incidentDate: caseData.incidentDate
          }
        });

        if (!exists) {
          await Case.create(caseData);
          console.log(`Cas créé: ${caseData.victimName}`);
        } else {
          console.log(`Cas existe déjà: ${caseData.victimName}`);
        }
      }
    }

    console.log('Opérations terminées avec succès !');
    process.exit();
  } catch (error) {
    console.error('Erreur lors de la mise à jour des utilisateurs :', error);
    process.exit(1);
  }
};

createUsers();

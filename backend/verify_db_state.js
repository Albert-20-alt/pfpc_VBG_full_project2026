const User = require('./models/User');
const sequelize = require('./config/database');

async function verifyUserState() {
    try {
        await sequelize.authenticate();
        console.log('Database connection OK.');

        // Get email from args or default to first user
        const targetEmail = process.argv[2];

        let users;
        if (targetEmail) {
            users = await User.findAll({ where: { email: targetEmail } });
        } else {
            // If no email, show all users (limited fields)
            users = await User.findAll();
        }

        console.log('\n--- VERIFICATION DE LA BASE DE DONNÉES ---');
        console.log(`Nombre d'utilisateurs trouvés: ${users.length}\n`);

        users.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Nom: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Rôle: ${user.role}`);
            console.log(`Région: ${user.region || 'N/A'}`);
            console.log(`STATUT: ${user.status.toUpperCase()}`);
            console.log(`Password Hash: ${user.password.substring(0, 15)}...`); // Show partial hash as proof
            console.log('-------------------------------------------');
        });

        if (users.length === 0 && targetEmail) {
            console.log(`Aucun utilisateur trouvé avec l'email: ${targetEmail}`);
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await sequelize.close();
    }
}

verifyUserState();

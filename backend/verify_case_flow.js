const http = require('http');
const sequelize = require('./config/database');
const Case = require('./models/Case');

// Configuration
const PORT = 5000;
const HOST = 'localhost';

// Helper to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function verifyFlow() {
    console.log('=== DÉBUT DU TEST DU FLUX DE SOUMISSION DES CAS ===\n');

    try {
        // 1. Test de la connexion DB
        console.log('[1/5] Vérification de la connexion base de données...');
        await sequelize.authenticate();
        console.log('✅ Connexion DB réussie.\n');

        // 2. Simulation soumission Agent (Ziguinchor)
        console.log('[2/5] Simulation soumission Agent (Région: Ziguinchor)...');
        const testCase = {
            victimAge: "25",
            victimGender: "Féminin",
            victimRegion: "Ziguinchor", // Important for region test
            victimCommune: "Ziguinchor",
            violenceType: "Physique",
            violenceDescription: "TEST AUTOMATISÉ - Description de violence",
            incidentDate: "2024-01-20",
            status: "pending",
            agentName: "Agent Test",
            agentId: "test-agent-001"
        };

        const postResponse = await makeRequest('POST', '/api/cases', testCase);

        if (postResponse.status === 201) {
            console.log('✅ Cas soumis avec succès via API.');
            console.log(`   ID du cas: ${postResponse.body.id}`);
        } else {
            console.error('❌ Échec de la soumission API:', postResponse.status, postResponse.body);
            process.exit(1);
        }

        const caseId = postResponse.body.id;

        // 3. Vérification persistance DB
        console.log('\n[3/5] Vérification persistance en base de données...');
        const dbCase = await Case.findByPk(caseId);
        if (dbCase) {
            console.log('✅ Cas retrouvé directement en base de données.');
            console.log(`   Région stockée: ${dbCase.victimRegion}`);
        } else {
            console.error('❌ Cas NON trouvé en base de données !');
        }

        // 4. Verification Visibilité (Admin Régional)
        console.log('\n[4/5] Vérification visibilité (Admin Régional vs Super Admin)...');
        console.log('   Récupération de tous les cas via API...');

        // NOTE: Actuellement l'API retourne TOUS les cas, donc on teste ce comportement
        const getResponse = await makeRequest('GET', '/api/cases');

        const allCases = getResponse.body;
        const myCase = allCases.find(c => c.id === caseId);

        if (myCase) {
            console.log('✅ Le cas est visible dans la liste globale (Super Admin voit tout).');
        } else {
            console.error('❌ Le cas est invisible dans la liste API !');
        }

        // Security Check
        console.log('\n[ANALYSE SÉCURITÉ]');
        console.log('⚠️  Vérification du filtrage par région :');
        const foreignRegions = allCases.filter(c => c.victimRegion !== 'Ziguinchor' && c.victimRegion !== null);

        if (foreignRegions.length > 0) {
            console.log(`⚠️  ATTENTION: L'API retourne ${foreignRegions.length} cas d'autres régions (ex: ${foreignRegions[0].victimRegion}).`);
            console.log('   -> Cela confirme que le filtrage régional n\'est pas encore actif.');
            console.log('   -> Le Super Admin voit tout (CORRECT).');
            console.log('   -> Le Regional Admin verrait aussi tout (A CORRIGER: Confidentialité).');
        } else {
            console.log('ℹ️  Seuls des cas de Ziguinchor (ou null) ont été trouvés (ou base vide).');
        }

        // 5. Nettoyage
        console.log('\n[5/5] Nettoyage du cas de test...');
        await Case.destroy({ where: { id: caseId } });
        console.log('✅ Cas de test supprimé.');

        console.log('\n=== FIN DU TEST: SUCCÈS ===');

    } catch (error) {
        console.error('\n❌ ERREUR CRITIQUE:', error);
    } finally {
        await sequelize.close();
    }
}

verifyFlow();

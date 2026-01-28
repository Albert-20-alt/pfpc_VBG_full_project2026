const http = require('http');
const sequelize = require('./config/database');
const Case = require('./models/Case');

// Configuration
const PORT = 5000;
const HOST = 'localhost';

// Helper to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: method,
            headers: headers,
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
    console.log('=== DÉBUT DU TEST DU FLUX DE SOUMISSION DES CAS (AUTHENTIFIÉ) ===\n');

    try {
        // 1. Test de la connexion DB
        console.log('[1/6] Vérification de la connexion base de données...');
        await sequelize.authenticate();
        console.log('✅ Connexion DB réussie.\n');

        // 2. Login
        console.log('[2/6] Authentification (Agent Ziguinchor)...');
        const loginData = {
            username: 'agentZig',
            password: 'password123'
        };
        const loginResponse = await makeRequest('POST', '/api/users/login', loginData);

        if (loginResponse.status !== 200) {
            console.error('❌ Échec du login:', loginResponse.status, loginResponse.body);
            process.exit(1);
        }

        const token = loginResponse.body.token;
        console.log('✅ Login réussi. Token récupéré.\n');

        // 3. Simulation soumission Agent (Ziguinchor)
        console.log('[3/6] Simulation soumission Agent (Région: Ziguinchor)...');
        const testCase = {
            victimAge: "25",
            victimGender: "Féminin",
            victimRegion: "Ziguinchor",
            victimCommune: "Ziguinchor",
            violenceType: "Physique",
            violenceDescription: "TEST AUTOMATISÉ AUTHENTIFIÉ - Description de violence",
            incidentDate: "2024-01-20",
            status: "pending",
            // Agent info should be inferred from token usually, but sending if API expects it
            agentName: "Moussa Diop (Agent Zig)",
        };

        const postResponse = await makeRequest('POST', '/api/cases', testCase, token);

        if (postResponse.status === 201) {
            console.log('✅ Cas soumis avec succès via API.');
            console.log(`   ID du cas: ${postResponse.body.id}`);
        } else {
            console.error('❌ Échec de la soumission API:', postResponse.status, postResponse.body);
            process.exit(1);
        }

        const caseId = postResponse.body.id;

        // 4. Vérification persistance DB
        console.log('\n[4/6] Vérification persistance en base de données...');
        const dbCase = await Case.findByPk(caseId);
        if (dbCase) {
            console.log('✅ Cas retrouvé directement en base de données.');
            console.log(`   Région stockée: ${dbCase.victimRegion}`);
            console.log(`   Statut: ${dbCase.status}`);
        } else {
            console.error('❌ Cas NON trouvé en base de données !');
        }

        // 5. Verification Visibilité (API)
        console.log('\n[5/6] Vérification visibilité via API...');

        // Using the same token (Agent) to list cases
        const getResponse = await makeRequest('GET', '/api/cases', null, token);
        const allCases = getResponse.body;

        if (Array.isArray(allCases)) {
            const myCase = allCases.find(c => c.id === caseId);
            if (myCase) {
                console.log('✅ Le cas est visible dans la liste retournée à l\'agent.');
            } else {
                console.error('❌ Le cas est invisible dans la liste API pour cet agent !');
            }
        } else {
            console.error('❌ Format de réponse inattendu pour GET /api/cases:', allCases);
        }

        // 6. Nettoyage
        console.log('\n[6/6] Nettoyage du cas de test...');
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

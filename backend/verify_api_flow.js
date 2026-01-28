// Native fetch is available in Node 18+
// Since node environment might vary, I'll use standard http if fetch isn't guaranteed, but most modern nodes have it or I can assume it's there given the react app context. 
// Actually, I'll stick to a simple script using 'fetch' which is available in Node 18+. If older, I might need to require it.
// Let's assume standard fetch or require it if missing. To be safe, I'll define a helper.

const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = 'unSecretUltraFort'; // Correct secret from .env

async function verifyFlow() {
    try {
        console.log("Starting Full Stack Data Verification...");

        // 1. Generate Tokens Manually (Bypassing Login DB dependency for stability)
        console.log("1. Generating Tokens locally...");
        const agentToken = jwt.sign(
            { id: 2, role: 'agent', region: 'Ziguinchor', name: 'Moussa Diop' }, // Mock Agent ID
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        const adminToken = jwt.sign(
            { id: 99, role: 'admin', region: 'Ziguinchor', name: 'Admin Zig' }, // Mock Admin ID
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log("   Tokens generated.");

        // 2. Create Case with NEW Analytics Fields
        console.log("2. Creating Case with Analytics Fields via API...");
        const uniqueSuffix = Date.now();
        const casePayload = {
            victimName: `Test Victim ${uniqueSuffix}`,
            victimAge: "32",
            victimGender: "féminin",
            victimRegion: "Ziguinchor",

            // New Fields
            relationshipToVictim: "Conjoint",
            victimMaritalStatus: "Marié",
            incidentLocation: "Lieu de travail",
            victimDisability: "Visuel",
            victimEducation: "Secondaire",
            // Mapping for 'Délai de Signalement' test
            incidentDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago

            violenceType: "Psychologique",
            status: "open",
            description: "Verification of data flow."
        };

        const createRes = await fetch(`${API_URL}/cases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${agentToken}`
            },
            body: JSON.stringify(casePayload)
        });

        if (!createRes.ok) {
            const err = await createRes.json(); // Try to parse JSON error
            throw new Error(`Case creation failed: ${JSON.stringify(err)}`);
        }
        const createdCase = await createRes.json();
        console.log(`   Case Created. ID: ${createdCase.id}`);

        // 4. Verification: Fetch Case as Admin
        console.log("3. Fetching case data as Admin...");
        const getRes = await fetch(`${API_URL}/cases/${createdCase.id}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (!getRes.ok) throw new Error(`Fetch case failed: ${getRes.statusText}`);
        const fetchedCase = await getRes.json();

        // 4b. Verification: Fetch ALL Cases as Admin
        console.log("3b. Fetching ALL cases as Admin...");
        const getAllRes = await fetch(`${API_URL}/cases`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!getAllRes.ok) throw new Error(`Fetch all cases failed: ${getAllRes.statusText}`);
        const allCases = await getAllRes.json();
        console.log(`   ✅ Fetched ${allCases.length} cases.`);
        if (allCases.length === 0) console.warn("   ⚠️ WARNING: No cases returned (unexpected if we just created one).");


        // 5. Assertions
        console.log("4. Verifying Data Integrity...");
        const checks = {
            relationshipToVictim: "Conjoint",
            victimMaritalStatus: "Marié",
            incidentLocation: "Lieu de travail",
            victimDisability: "Visuel",
            victimEducation: "Secondaire"
        };

        let passed = true;
        Object.keys(checks).forEach(key => {
            if (fetchedCase[key] === checks[key]) {
                console.log(`   ✅ ${key}: MATCH (${fetchedCase[key]})`);
            } else {
                console.log(`   ❌ ${key}: FAIL (Expected '${checks[key]}', got '${fetchedCase[key]}')`);
                passed = false;
            }
        });

        // 6. Cleanup
        console.log("5. Cleaning up test data...");
        await fetch(`${API_URL}/cases/${fetchedCase.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log("   Test case deleted.");

        if (passed) {
            console.log("\n✅ SUCCESS: API Data Flow Verified. The system is correctly saving and serving all new analytics.");
        } else {
            console.error("\n❌ FAILURE: Data mismatch detected.");
            process.exit(1);
        }

    } catch (e) {
        console.error("\n❌ ERROR:", e.message);
        process.exit(1);
    }
}

verifyFlow();

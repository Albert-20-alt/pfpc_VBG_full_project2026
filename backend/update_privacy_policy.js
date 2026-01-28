require('dotenv').config();
const SiteContent = require('./models/SiteContent');
const sequelize = require('./config/database');

const privacyPolicyText = `
<h2>1. Introduction</h2>
<p>La <strong>Plateforme de Prise en Charge des Violences Basées sur le Genre (PFPC VBG)</strong> s'engage rigoureusement à protéger la vie privée et la sécurité des données de ses utilisateurs et des survivant(e)s. La confidentialité est au cœur de notre mission.</p>
<p>Cette politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons les informations personnelles et sensibles recueillies via notre plateforme.</p>

<h2>2. Collecte des Données</h2>
<p>Nous collectons uniquement les données strictement nécessaires à la gestion des cas et à l'amélioration de nos services :</p>
<ul>
    <li><strong>Informations des agents :</strong> Nom, contact, rôle et structure d'appartenance.</li>
    <li><strong>Données sur les cas (VBG) :</strong> Informations démographiques anonymisées (âge, sexe, région), types de violence, services offerts et statut de prise en charge.</li>
    <li><strong>Données techniques :</strong> Logs de connexion et d'activité pour assurer la sécurité du système (audit trail).</li>
</ul>

<h2>3. Utilisation des Informations</h2>
<p>Les informations collectées sont utilisées pour :</p>
<ul>
    <li>Assurer une gestion efficace et coordonnée des cas de VBG.</li>
    <li>Générer des statistiques anonymes pour le plaidoyer et l'amélioration des politiques publiques.</li>
    <li>Garantir la sécurité des utilisateurs et prévenir les accès non autorisés.</li>
</ul>
<p><strong>Nous ne vendons ni ne louons aucune donnée personnelle à des tiers.</strong></p>

<h2>4. Confidentialité et Sécurité</h2>
<p>La sécurité est notre priorité absolue. Nous mettons en œuvre des mesures techniques et organisationnelles robustes :</p>
<ul>
    <li><strong>Chiffrement :</strong> Toutes les communications sont chiffrées via le protocole SSL/TLS. Les mots de passe sont hachés de manière sécurisée.</li>
    <li><strong>Contrôle d'accès :</strong> L'accès aux données sensibles est strictement restreint aux personnels autorisés en fonction de leur rôle (Rôle-Based Access Control).</li>
    <li><strong>Hébergement sécurisé :</strong> Vos données sont hébergées sur des serveurs sécurisés conformes aux standards internationaux.</li>
</ul>

<h2>5. Vos Droits</h2>
<p>Conformément aux lois en vigueur sur la protection des données personnelles, vous disposez des droits suivants :</p>
<ul>
    <li>Droit d'accès à vos informations personnelles.</li>
    <li>Droit de rectification des informations inexactes.</li>
    <li>Droit à l'effacement (dans la mesure où cela ne nuit pas à l'intégrité des dossiers légaux ou médicaux).</li>
</ul>

<h2>6. Cookies et Traceurs</h2>
<p>Nous utilisons des cookies techniques essentiels au fonctionnement de la session sécurisée. Aucun cookie publicitaire ou de traçage tiers n'est utilisé.</p>

<h2>7. Modifications de la Politique</h2>
<p>Cette politique peut être mise à jour périodiquement. Toutes les modifications seront publiées sur cette page avec la date de révision.</p>

<h2>8. Contact</h2>
<p>Pour toute question concernant cette politique ou la confidentialité de vos données, veuillez contacter l'administrateur système ou le point focal VBG de votre région.</p>
`;

async function updatePolicy() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données réussie.');

        // Sync model just in case (though normally handled by server.js)
        await SiteContent.sync();

        const [content, created] = await SiteContent.upsert({
            key: 'privacy_policy',
            content: privacyPolicyText,
            lastUpdated: new Date()
        });

        console.log('Politique de confidentialité mise à jour avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la politique :', error);
        process.exit(1);
    }
}

updatePolicy();

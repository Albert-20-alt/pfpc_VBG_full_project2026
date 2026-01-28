const sequelize = require('./config/database');
const SiteContent = require('./models/SiteContent');

async function populateContent() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données établie.');

        // Content for Terms of Service
        const termsContent = `
<h2>1. Introduction</h2>
<p>Bienvenue sur la <strong>Plateforme de Prise en Charge des Violences Basées sur le Genre (PFPC VBG)</strong>. Cette plateforme est un outil numérique sécurisé destiné à faciliter la signalisation, le suivi et la gestion des cas de VBG.</p>

<h2>2. Objet de la Plateforme</h2>
<p>La PFPC VBG a pour vocation de coordonner les actions des différents acteurs (agents de santé, forces de l'ordre, travailleurs sociaux, justice) afin d'assurer une prise en charge holistique et efficace des survivant(e)s.</p>

<h2>3. Engagement de Confidentialité</h2>
<p>L'accès à cette plateforme est strictement réservé aux professionnels habilités. En utilisant ce service, vous vous engagez à :</p>
<ul>
    <li>Respecter scrupuleusement le secret professionnel.</li>
    <li>Garantir la confidentialité absolue des données des victimes.</li>
    <li>Ne jamais partager vos identifiants de connexion.</li>
</ul>

<h2>4. Utilisation des Données</h2>
<p>Les informations saisies sur cette plateforme sont sensibles. Elles ne doivent être utilisées que pour les besoins stricts de la prise en charge. Toute extraction, reproduction ou diffusion non autorisée est passible de sanctions pénales.</p>

<h2>5. Responsabilité</h2>
<p>Chaque utilisateur est responsable des actions effectuées sous son compte. Tout abus ou négligence compromettant la sécurité des données entraînera la suspension immédiate de l'accès et des poursuites judiciaires éventuelles.</p>
`;

        // Content for Privacy Policy
        const privacyContent = `
<h2>1. Collecte de Données</h2>
<p>Dans le cadre de la prise en charge des VBG, nous collectons les types de données suivants :</p>
<ul>
    <li><strong>Données d'identification :</strong> (Nom, Prénom, Âge, Sexe - collectés dans le respect des principes de minimisation).</li>
    <li><strong>Données sensibles :</strong> Informations relatives aux incidents de violence, à la santé et au suivi social.</li>
</ul>

<h2>2. Utilisation des Informations</h2>
<p>Les données collectées sont utilisées exclusivement pour :</p>
<ul>
    <li>Assurer le suivi médical, psychosocial et juridique des survivant(e)s.</li>
    <li>Générer des statistiques anonymisées pour améliorer les politiques de prévention.</li>
    <li>Coordonner les interventions entre les différents services compétents.</li>
</ul>

<h2>3. Protection et Sécurité</h2>
<p>La sécurité de vos données est notre priorité absolue. Nous mettons en œuvre des mesures techniques robustes, incluant :</p>
<ul>
    <li>Le chiffrement des données en transit et au repos.</li>
    <li>Des contrôles d'accès stricts basés sur les rôles (RBAC).</li>
    <li>Des audits de sécurité réguliers.</li>
</ul>

<h2>4. Partage des Données</h2>
<p>Les données personnelles identifiables ne sont jamais partagées avec des tiers non autorisés. Seuls les acteurs directement impliqués dans la prise en charge du cas ont accès aux informations nécessaires à leur intervention.</p>

<h2>5. Vos Droits</h2>
<p>Conformément à la législation sur la protection des données personnelles, les personnes concernées disposent d'un droit d'accès et de rectification, exercé dans le respect des impératifs de protection et de confidentialité propres aux situations de VBG.</p>
`;

        // Update Terms
        await SiteContent.upsert({
            key: 'terms_of_service',
            content: termsContent
        });
        console.log('Conditions d\'Utilisation mises à jour.');

        // Update Privacy
        await SiteContent.upsert({
            key: 'privacy_policy',
            content: privacyContent
        });
        console.log('Politique de Confidentialité mise à jour.');

    } catch (error) {
        console.error('Erreur lors de la mise à jour du contenu :', error);
    } finally {
        await sequelize.close();
    }
}

populateContent();

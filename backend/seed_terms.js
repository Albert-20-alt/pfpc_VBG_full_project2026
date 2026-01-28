const sequelize = require('./config/database');
const SiteContent = require('./models/SiteContent');

const termsContent = `
<h1>Conditions d'Utilisation de la Plateforme PFPC VBG</h1>
<p>Dernière mise à jour : 23 Janvier 2026</p>

<h2>1. Introduction</h2>
<p>Bienvenue sur la Plateforme de Prise en Charge des Violences Basées sur le Genre (PFPC VBG). En accédant à ce site, vous acceptez d'être lié par les présentes conditions d'utilisation, toutes les lois et réglementations applicables, et vous acceptez que vous êtes responsable du respect de toutes les lois locales applicables.</p>

<h2>2. Utilisation Autorisée</h2>
<p>Cette plateforme est destinée à faciliter la coordination, le suivi et la gestion des cas de VBG par les acteurs autorisés (agents, administrateurs, super-administrateurs) et à fournir des informations au public.</p>
<ul>
    <li>Vous vous engagez à ne pas utiliser cette plateforme à des fins illégales ou interdites.</li>
    <li>L'accès aux données sensibles est strictement réservé aux utilisateurs habilités.</li>
</ul>

<h2>3. Confidentialité et Protection des Données</h2>
<p>La protection de la vie privée des survivant(e)s et la confidentialité des données sont notre priorité absolue. L'utilisation de cette plateforme est soumise à notre <a href="/privacy">Politique de Confidentialité</a>.</p>
<p>Tout utilisateur disposant d'un accès aux dossiers s'engage à respecter le secret professionnel et la confidentialité absolue des informations traitées.</p>

<h2>4. Comptes Utilisateurs</h2>
<p>Si vous avez un compte sur cette plateforme :</p>
<ul>
    <li>Vous êtes responsable du maintien de la confidentialité de votre mot de passe.</li>
    <li>Vous ne devez pas partager vos accès avec des tiers.</li>
    <li>Vous devez signaler immédiatement toute utilisation non autorisée de votre compte.</li>
</ul>

<h2>5. Propriété Intellectuelle</h2>
<p>Le contenu, l'organisation, les graphiques, le design et autres éléments liés à la plateforme sont protégés par les droits d'auteur et autres droits de propriété intellectuelle.</p>

<h2>6. Limitation de Responsabilité</h2>
<p>La PFPC VBG s'efforce de maintenir la plateforme accessible et les informations exactes, mais ne peut garantir une disponibilité ininterrompue ou l'absence d'erreurs. Nous ne saurions être tenus responsables des dommages directs ou indirects résultant de l'utilisation de cette plateforme.</p>

<h2>7. Modifications</h2>
<p>Nous nous réservons le droit de réviser ces conditions d'utilisation à tout moment sans préavis. En utilisant ce site web, vous acceptez d'être lié par la version actuelle de ces conditions d'utilisation.</p>

<h2>8. Contact</h2>
<p>Pour toute question concernant ces conditions, veuillez nous contacter via la page <a href="/contact">Contact</a>.</p>
`;

async function seedContent() {
    try {
        await sequelize.authenticate();
        console.log('Connexion établie.');

        await SiteContent.upsert({
            key: 'terms_of_service',
            content: termsContent,
            lastUpdated: new Date()
        });

        console.log('Contenu des Conditions d\'utilisation mis à jour avec succès.');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du contenu:', error);
    } finally {
        await sequelize.close();
    }
}

seedContent();

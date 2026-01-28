# Plateforme VBG – Qualité et audits

Ce projet est équipé pour garantir la sécurité, la performance et l’accessibilité, tout en préservant le design existant.

## Audits de sécurité

Vérifiez les vulnérabilités dans les dépendances :
```bash
npm run audit:security
```

## Audits de performance

1. Démarrez le serveur local :
```bash
npm run dev
```
2. Ouvrez un autre terminal et lancez :
```bash
npm run audit:performance
```
Le rapport sera généré dans `lighthouse-performance.html`.

## Audits d’accessibilité

1. Démarrez le serveur local :
```bash
npm run dev
```
2. Ouvrez un autre terminal et lancez :
```bash
npm run audit:accessibility
```
Le rapport sera généré dans `lighthouse-accessibility.html`.

## Conseils de maintenance

- Effectuez ces audits avant chaque mise en production.
- Gardez vos dépendances à jour (`npm outdated` puis `npm update`).
- Corrigez les problèmes signalés par les audits.
- Testez la navigation clavier et l’accessibilité après chaque ajout de fonctionnalité.

---

Pour toute demande d’amélioration ou d’automatisation supplémentaire (tests, CI/CD, etc.), n’hésitez pas à demander !

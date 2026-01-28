const express = require('express');
const router = express.Router();
const SystemSetting = require('../models/SystemSetting');
const { Op } = require('sequelize');

// GET settings
router.get('/', async (req, res) => {
    try {
        let settings = await SystemSetting.findByPk('global_config');
        if (!settings) {
            // Create default if not exists
            settings = await SystemSetting.create({ key: 'global_config' });
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des paramètres', error: error.message });
    }
});

// PUT settings
router.put('/', async (req, res) => {
    try {
        const [settings, created] = await SystemSetting.upsert({
            key: 'global_config',
            ...req.body
        });

        // Remove 'key' from response or just return full object
        res.json({ message: 'Paramètres mis à jour avec succès', settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres', error: error.message });
    }
});

module.exports = router;

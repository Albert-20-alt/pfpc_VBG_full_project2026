const express = require('express');
const router = express.Router();
const ContactInfo = require('../models/ContactInfo');

// Helper middleware to check for Admin/SuperAdmin (reused logic)
const checkAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Accès refusé' });

    const jwt = require('jsonwebtoken');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (verified.role !== 'super-admin' && verified.role !== 'admin') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
        }
        req.user = verified;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token invalide' });
    }
};

// GET /api/contact-info - Public
router.get('/', async (req, res) => {
    try {
        let info = await ContactInfo.findOne();
        if (!info) {
            // Create default if not exists
            info = await ContactInfo.create({});
        }
        res.json(info);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/contact-info - Protected (Admin/SuperAdmin)
router.put('/', checkAdmin, async (req, res) => {
    try {
        let info = await ContactInfo.findOne();
        if (!info) {
            info = await ContactInfo.create({});
        }

        const { address, email, phone } = req.body;

        info.address = address || info.address;
        info.email = email || info.email;
        info.phone = phone || info.phone;

        await info.save();
        res.json(info);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST /api/messages - Submit a new message (Public)
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        const newMessage = await Message.create({
            firstName,
            lastName,
            email,
            message
        });

        res.status(201).json(newMessage);
    } catch (err) {
        console.error("Error creating message:", err);
        res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
    }
});

// GET /api/messages - Get all messages (Protected: SuperAdmin only)
router.get('/', async (req, res) => {
    try {
        console.log('[DEBUG] GET /messages hit');
        // Auth check manually since middleware isn't global
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Accès refusé' });

        const jwt = require('jsonwebtoken');
        let verified;
        try {
            verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        } catch (e) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        if (verified.role !== 'super-admin') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
        }

        const messages = await Message.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
    }
});

// PUT /api/messages/:id/read - Mark as read (Protected: SuperAdmin only)
router.put('/:id/read', async (req, res) => {
    try {
        // Auth check
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Accès refusé' });

        const jwt = require('jsonwebtoken');
        let verified;
        try {
            verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        } catch (e) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        if (verified.role !== 'super-admin') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
        }

        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        message.status = 'read';
        await message.save();

        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/messages/:id - Delete message (Protected: SuperAdmin only)
router.delete('/:id', async (req, res) => {
    try {
        // Auth check
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Accès refusé' });

        const jwt = require('jsonwebtoken');
        let verified;
        try {
            verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        } catch (e) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        if (verified.role !== 'super-admin') {
            return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
        }

        const message = await Message.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        await message.destroy();
        res.json({ message: 'Message supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

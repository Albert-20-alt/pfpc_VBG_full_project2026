const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const { verifyToken, checkRole } = require('../middleware/auth');

// Get content by key (Public)
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const content = await SiteContent.findByPk(key);

        if (!content) {
            // Return default content structure if not found (or empty string)
            return res.json({ content: '' });
        }

        res.json(content);
    } catch (error) {
        console.error('Error fetching site content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// Update content (SuperAdmin only)
router.put('/:key', verifyToken, checkRole('super-admin'), async (req, res) => {
    try {
        const { key } = req.params;
        const { content } = req.body;

        const [siteContent, created] = await SiteContent.upsert({
            key,
            content,
            lastUpdated: new Date()
        });

        res.json(siteContent);
    } catch (error) {
        console.error('Error updating site content:', error);
        res.status(500).json({ error: error.message || 'Failed to update content' });
    }
});

module.exports = router;

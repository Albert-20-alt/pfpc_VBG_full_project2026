const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

const mult = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = mult.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create dir if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = mult({ storage: storage });

// Créer une ressource (avec upload de fichier)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, type, category, region, addedBy } = req.body;
    let fileUrl = '';

    if (req.file) {
      // Store relative path or full URL depending on preference. 
      // Storing relative path 'uploads/filename.ext' is usually better.
      fileUrl = req.file.path.replace(/\\/g, "/"); // Normalize path for Windows/Unix compatibility
    }

    const newResource = await Resource.create({
      title,
      type,
      category,
      region,
      link: fileUrl,
      addedBy: addedBy
    });

    res.status(201).json(newResource);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Récupérer toutes les ressources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.findAll({ include: 'uploader' });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer une ressource par ID
router.get('/:id', async (req, res) => {
  try {
    const found = await Resource.findByPk(req.params.id, { include: 'uploader' });
    if (!found) return res.status(404).json({ error: 'Ressource non trouvée' });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour une ressource
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Resource.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedRes = await Resource.findByPk(req.params.id);
      return res.json(updatedRes);
    }
    return res.status(404).json({ error: 'Ressource non trouvée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer une ressource (Protected: SuperAdmin only)
router.delete('/:id', async (req, res) => {
  try {
    // Basic Auth Check
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Accès refusé' });

    const jwt = require('jsonwebtoken'); // Lazy load
    let verified;
    try {
      verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
      return res.status(400).json({ error: 'Token invalide' });
    }

    if (verified.role !== 'super-admin') {
      return res.status(403).json({ error: 'Seul le super-admin peut supprimer des ressources.' });
    }

    const deleted = await Resource.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      // Optional: Delete file from filesystem too
      return res.json({ message: 'Ressource supprimée' });
    }
    return res.status(404).json({ error: 'Ressource non trouvée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

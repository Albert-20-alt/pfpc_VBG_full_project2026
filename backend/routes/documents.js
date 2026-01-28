const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

const mult = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage for Documents
const storage = mult.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/documents/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = mult({ storage: storage });

const { authenticateToken: auth } = require('../middleware/auth'); // Assuming auth middleware exists and is needed

// Créer un document (avec upload)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { caseId, type, sharedWith } = req.body;
    let fileUrl = '';

    if (req.file) {
      fileUrl = req.file.path.replace(/\\/g, "/");
    }

    if (!caseId) {
      return res.status(400).json({ error: "Case ID is required for document upload." });
    }

    const newDocument = await Document.create({
      name: req.file ? req.file.originalname : 'Sans titre',
      url: fileUrl,
      caseId: caseId,
      // If Document model has 'type' or 'sharedWith', add them here. 
      // Based on what we saw, Document model only has name, url, uploadedBy, caseId.
      // We might need to add 'type' to the model if we want to store it, but for now let's stick to the schema.
      uploadedBy: req.body.uploadedBy // This might come from auth middleware if we use it, req.user.id
    });

    res.status(201).json(newDocument);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Récupérer tous les documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.findAll({ include: ['uploader', 'case'] });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer un document par ID
router.get('/:id', async (req, res) => {
  try {
    const found = await Document.findByPk(req.params.id, { include: ['uploader', 'case'] });
    if (!found) return res.status(404).json({ error: 'Document non trouvé' });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour un document
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Document.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedDoc = await Document.findByPk(req.params.id);
      return res.json(updatedDoc);
    }
    return res.status(404).json({ error: 'Document non trouvé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un document
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Document.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.json({ message: 'Document supprimé' });
    }
    return res.status(404).json({ error: 'Document non trouvé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

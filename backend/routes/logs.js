const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// Créer un log
router.post('/', async (req, res) => {
  try {
    const newLog = await Log.create(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Récupérer tous les logs
router.get('/', async (req, res) => {
  try {
    const logs = await Log.findAll({ include: 'user' });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer un log par ID
router.get('/:id', async (req, res) => {
  try {
    const found = await Log.findByPk(req.params.id, { include: 'user' });
    if (!found) return res.status(404).json({ error: 'Log non trouvé' });
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour un log
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Log.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedLog = await Log.findByPk(req.params.id);
      return res.json(updatedLog);
    }
    return res.status(404).json({ error: 'Log non trouvé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un log
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Log.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.json({ message: 'Log supprimé' });
    }
    return res.status(404).json({ error: 'Log non trouvé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

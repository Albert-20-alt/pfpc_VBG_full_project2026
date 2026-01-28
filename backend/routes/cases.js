const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const { authenticateToken: auth } = require('../middleware/auth');
const { logCaseAccess, logEvent, logUnauthorized } = require('../middleware/auditLog');
const { caseValidation, idParamValidation } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

// Stricter rate limit for case routes (sensitive victim data)
const caseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: { error: 'Trop de requêtes sur les données sensibles. Réessayez plus tard.' }
});

// Apply rate limiting to all case routes
router.use(caseLimiter);

// Helper to check case access authorization
const canAccessCase = (user, caseData) => {
  if (user.role === 'super-admin') return true;
  if (user.role === 'admin' && caseData.victimRegion === user.region) return true;
  if (user.role === 'agent' && caseData.agentId == user.id) return true;
  return false;
};

// Créer un cas with audit logging
router.post('/', auth, caseValidation, logCaseAccess('CASE_CREATE'), async (req, res) => {
  try {
    console.log('[DEBUG] CASE CREATE BODY:', JSON.stringify(req.body, null, 2));
    const caseData = {
      ...req.body,
      agentId: req.user.id,
      agentName: req.user.name || req.body.agentName,
      victimRegion: req.user.role === 'agent' ? req.user.region : (req.body.victimRegion || req.user.region)
    };

    const newCase = await Case.create(caseData);
    res.status(201).json(newCase);
  } catch (err) {
    console.error('Case create error:', err.message);
    res.status(400).json({ error: 'Erreur lors de la création du cas' });
  }
});

// Récupérer tous les cas (Filtered by Role) with audit logging
router.get('/', auth, logCaseAccess('CASE_VIEW'), async (req, res) => {
  try {
    console.log('[DEBUG] GET /cases hit by user:', req.user.id, req.user.role); // DEBUG
    let whereClause = {};

    if (req.user.role === 'admin') {
      whereClause.victimRegion = req.user.region;
    } else if (req.user.role === 'agent') {
      whereClause.agentId = req.user.id;
    }
    // Super-admin: No filter (sees all)
    console.log('[DEBUG] whereClause:', JSON.stringify(whereClause)); // DEBUG

    const cases = await Case.findAll({ where: whereClause });
    console.log(`[DEBUG] Found ${cases.length} cases`); // DEBUG
    res.json(cases);
  } catch (err) {
    console.error('Case list error:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un cas par ID with access control check
router.get('/:id', auth, idParamValidation, async (req, res) => {
  try {
    const found = await Case.findByPk(req.params.id);
    if (!found) {
      return res.status(404).json({ error: 'Cas non trouvé' });
    }

    // Security: Verify user can access this case
    if (!canAccessCase(req.user, found)) {
      await logUnauthorized(req, 'case_access_denied');
      return res.status(403).json({ error: 'Accès non autorisé à ce dossier' });
    }

    // Log the access
    await logEvent('CASE_VIEW', req, {
      resourceType: 'case',
      resourceId: req.params.id,
      details: { victimRegion: found.victimRegion }
    });

    res.json(found);
  } catch (err) {
    console.error('Case get error:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un cas with access control
router.put('/:id', auth, idParamValidation, caseValidation, async (req, res) => {
  try {
    const existingCase = await Case.findByPk(req.params.id);
    if (!existingCase) {
      return res.status(404).json({ error: 'Cas non trouvé' });
    }

    // Security: Verify user can modify this case
    if (!canAccessCase(req.user, existingCase)) {
      await logUnauthorized(req, 'case_update_denied');
      return res.status(403).json({ error: 'Accès non autorisé à ce dossier' });
    }

    const { id, ...updateData } = req.body;
    await existingCase.update(updateData);

    // Log the update
    await logEvent('CASE_UPDATE', req, {
      resourceType: 'case',
      resourceId: req.params.id
    });

    return res.json(existingCase);
  } catch (err) {
    console.error('Case update error:', err.message);
    res.status(400).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Supprimer un cas - Super Admin only
// Supprimer un cas - Super Admin & Regional Admin
router.delete('/:id', auth, idParamValidation, async (req, res) => {
  try {
    const caseToDelete = await Case.findByPk(req.params.id);

    if (!caseToDelete) {
      return res.status(404).json({ error: 'Cas non trouvé' });
    }

    // Security: Super Admin or Admin of the same region
    const isSuperAdmin = req.user.role === 'super-admin';
    const isRegionalAdmin = req.user.role === 'admin' && req.user.region === caseToDelete.victimRegion;

    if (!isSuperAdmin && !isRegionalAdmin) {
      await logUnauthorized(req, 'case_delete_denied');
      return res.status(403).json({ error: 'Vous n\'avez pas la permission de supprimer ce dossier' });
    }

    await caseToDelete.destroy();

    await logEvent('CASE_DELETE', req, {
      resourceType: 'case',
      resourceId: req.params.id
    });

    return res.json({ message: 'Cas supprimé' });
  } catch (err) {
    console.error('Case delete error:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

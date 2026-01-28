const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { loginValidation, userCreationValidation, userUpdateValidation } = require('../middleware/validate');
const { logLogin, logEvent } = require('../middleware/auditLog');

// Security constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000; // 30 minutes
const JWT_EXPIRY = '4h'; // 4 hours for sensitive platform

// Middleware to verify token
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Accès refusé' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Token invalide ou expiré' });
    }
};

// Login with account lockout and audit logging
router.post('/login', loginValidation, async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });

        // User not found - log failed attempt but give generic error
        if (!user) {
            await logLogin(req, false, null, null, { reason: 'user_not_found' });
            return res.status(400).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
            await logLogin(req, false, user.id, user.username, { reason: 'account_locked' });
            return res.status(423).json({
                error: `Compte verrouillé. Réessayez dans ${minutesLeft} minutes.`
            });
        }

        // Check if account is inactive
        if (user.status !== 'active') {
            await logLogin(req, false, user.id, user.username, { reason: 'account_inactive' });
            return res.status(403).json({ error: 'Compte inactif. Contactez un administrateur.' });
        }

        // Verify password
        const validPass = await bcrypt.compare(password, user.password);

        if (!validPass) {
            // Increment failed attempts
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const updates = {
                failedLoginAttempts: attempts,
                lastFailedLogin: new Date()
            };

            // Lock account after max attempts
            if (attempts >= MAX_LOGIN_ATTEMPTS) {
                updates.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
                await logEvent('ACCOUNT_LOCKED', req, {
                    userId: user.id,
                    userName: user.username,
                    details: { attempts, lockDurationMinutes: 30 }
                });
            }

            await user.update(updates);
            await logLogin(req, false, user.id, user.username, {
                reason: 'invalid_password',
                attempts
            });

            // Show remaining attempts warning
            const remaining = MAX_LOGIN_ATTEMPTS - attempts;
            if (remaining > 0 && remaining <= 2) {
                return res.status(400).json({
                    error: `Mot de passe incorrect. ${remaining} tentative(s) restante(s).`
                });
            }

            return res.status(400).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

        // Successful login - reset lockout counters
        await user.update({
            failedLoginAttempts: 0,
            lockUntil: null,
            lastLogin: new Date()
        });

        // Create secure JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                region: user.region,
                name: user.name
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: JWT_EXPIRY }
        );

        // Log successful login
        await logLogin(req, true, user.id, user.username);

        res.json({
            token,
            expiresIn: JWT_EXPIRY,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                region: user.region,
                department: user.department,
                commune: user.commune
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get Check Auth / Me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register / Create User (Protected)
router.post('/', auth, userCreationValidation, async (req, res) => {
    try {
        const { name, username, email, password, role, region, department, commune, phone } = req.body;

        // Security check: Only Admins and Super Admins can create users
        if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        // Enforce Regional Rules for Admins
        let finalRegion = region;
        let finalRole = role;

        if (req.user.role === 'admin') {
            // Admin can strictly ONLY create agents in their own region
            finalRegion = req.user.region;
            finalRole = 'agent';

            // Check if they tried to set something else
            if (role && role !== 'agent') {
                return res.status(403).json({ error: "Les administrateurs ne peuvent créer que des comptes 'Agent'." });
            }
            if (region && region !== req.user.region) {
                return res.status(403).json({ error: "Vous ne pouvez créer des utilisateurs que dans votre région." });
            }

            // Optional: Prevent creating users if region is missing (shouldn't happen for valid admins)
            if (!finalRegion) {
                return res.status(400).json({ error: "Erreur de configuration: Votre compte n'a pas de région assignée." });
            }
        }

        // Sanitize email: Convert empty string to null to avoid validation error
        const sanitizedEmail = email && email.trim() !== '' ? email : null;

        // Check if user exists (by email or username)
        const existingEmail = sanitizedEmail ? await User.findOne({ where: { email: sanitizedEmail } }) : null;
        if (existingEmail) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            username,
            email: sanitizedEmail,
            password: hashedPassword,
            role: finalRole || 'agent',
            region: finalRegion,
            department,
            commune,
            phone
        });

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            region: newUser.region,
            phone: newUser.phone
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User (Protected)
router.put('/:id', auth, userUpdateValidation, async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, username, email, role, region, department, commune, phone, status, password } = req.body;

        // Security: Only admins can update. 
        // Super admin can update anyone. 
        // Admin can update agents in their region.
        // Self-update is handled elsewhere or here? Assuming admin management for now.

        // Security: Only admins can update, OR the user themselves.
        if (req.user.role !== 'admin' && req.user.role !== 'super-admin' && req.user.id != userId) {
            return res.status(403).json({ error: 'Non autorisé' });
        }

        const userToUpdate = await User.findByPk(userId);
        if (!userToUpdate) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        if (req.user.role === 'admin' && req.user.id != userId) {
            // Admin can only update agents in their region (unless it's themselves)
            if (userToUpdate.region !== req.user.region) {
                return res.status(403).json({ error: 'Vous ne pouvez modifier que les agents de votre région.' });
            }
        }

        // Update fields
        if (name) userToUpdate.name = name;
        if (username) userToUpdate.username = username;
        // Allow clearing email if sent as empty string, or updating if valid
        if (email !== undefined) userToUpdate.email = email && email.trim() !== '' ? email : null;

        // Security: Only Super Admin can change Roles and Regions
        if (role && req.user.role === 'super-admin') userToUpdate.role = role;
        if (region && req.user.role === 'super-admin') userToUpdate.region = region;
        if (department) userToUpdate.department = department;
        if (commune) userToUpdate.commune = commune;
        if (phone) userToUpdate.phone = phone;
        if (req.body.profilePicture !== undefined) userToUpdate.profilePicture = req.body.profilePicture; // Allow null to reset
        if (status) userToUpdate.status = status;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            userToUpdate.password = await bcrypt.hash(password, salt);
        }

        await userToUpdate.save();

        res.json({
            id: userToUpdate.id,
            name: userToUpdate.name,
            email: userToUpdate.email,
            role: userToUpdate.role,
            region: userToUpdate.region,
            region: userToUpdate.region,
            phone: userToUpdate.phone,
            profilePicture: userToUpdate.profilePicture,
            status: userToUpdate.status
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users (protected)
router.get('/', auth, async (req, res) => {
    try {
        let whereClause = {};

        // RBAC: Admins can only see users in their region
        if (req.user.role === 'admin') {
            whereClause.region = req.user.region;
            // Optional: If Admin should ONLY see Agents, uncomment below. 
            // But usually seeing other colleagues in the region is fine. 
            // The constraint is on CREATION/EDIT.
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete User (Protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const userId = req.params.id;

        const userToDelete = await User.findByPk(userId);
        if (!userToDelete) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        // Security:
        // 1. Super Admin can delete anyone (except themselves)
        // 2. Admin can ONLY delete 'agent' in their OWN region
        if (req.user.role === 'admin') {
            if (userToDelete.role !== 'agent') {
                return res.status(403).json({ error: 'Vous ne pouvez supprimer que des agents.' });
            }
            if (userToDelete.region !== req.user.region) {
                return res.status(403).json({ error: 'Vous ne pouvez supprimer que des agents de votre région.' });
            }
        } else if (req.user.role !== 'super-admin') {
            // Not admin and not super-admin
            return res.status(403).json({ error: 'Non autorisé.' });
        }

        // Prevent deleting self (redundant check for admin vs agent, but good safety)
        if (userToDelete.id === req.user.id) {
            return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
        }

        await userToDelete.destroy();

        res.json({ message: 'Utilisateur supprimé avec succès', id: userId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

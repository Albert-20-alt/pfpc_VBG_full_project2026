const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User'); // Assuming we might need to include user info later
const { verifyToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// GET /api/tasks - Get all tasks for the current user (or filtered)
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let whereClause = {};

        if (userRole === 'super-admin') {
            // Super Admin sees all tasks
            whereClause = {};
        } else {
            // Users see tasks:
            // 1. Created by them
            // 2. Assigned to them
            // 3. Where they are participants
            whereClause = {
                [Op.or]: [
                    { createdBy: userId },
                    { assignedTo: userId },
                    // For JSON array 'participants', handling in MySQL/Sequelize can be tricky.
                    // A simple JSON_CONTAINS or substring match might be needed if using SQLite/MySQL JSON.
                    // But for simple "am I in the list", we often pull and filter or use:
                    // sequelize.fn('JSON_CONTAINS', sequelize.col('participants'), JSON.stringify(userId)) (MySQL)
                    // For compatibility, we might just fetch relevant ones or stick to assignedTo for now if complex.
                    // Let's try basic JSON string match hack or fetch all and filter in JS if set is small?
                    // Better: standard JSON op if mysql:
                    // { participants: { [Op.like]: `%\n${userId}\n%` } } // No..
                ]
            };
        }

        let tasks = await Task.findAll({
            where: whereClause,
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        // Manual filter for participants if needed, or if whereClause is simpler
        if (userRole !== 'super-admin') {
            // Re-filter for participants specifically if JSON query above is tricky without specific dialect setup
            // Actually, if we use:
            // where: { [Op.or]: [{createdBy: userId}, {assignedTo: userId}] }
            // We miss participants.
            // Let's fetch broader set or all and filter for now if dataset is small, 
            // OR assuming backend runs MySQL 5.7+:
            // [Op.or]: [..., sequelize.literal(`JSON_CONTAINS(participants, '${userId}')`)]

            // Safest for "quick start" without strict JSON setup -> Fetch where created/assigned, OR fetch ALL relevant
            // For strict correctness with JSON array participants:
            const allTasks = await Task.findAll({ order: [['date', 'ASC'], ['time', 'ASC']] });
            const relevantTasks = allTasks.filter(t =>
                t.createdBy === userId ||
                t.assignedTo === userId ||
                (t.participants && t.participants.includes(userId))
            );
            return res.json(relevantTasks);
        }

        res.json(tasks);
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// POST /api/tasks - Create a task
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, date, time, type, priority, location, meetingLink, relatedCaseId, assignedTo, participants } = req.body;

        console.log('Creating task with data:', { title, description, date, time, type, priority, location, meetingLink, relatedCaseId, assignedTo, participants });

        const newTask = await Task.create({
            title,
            description,
            date,
            time,
            type,
            priority,
            location,
            meetingLink,
            relatedCaseId,
            assignedTo: assignedTo || req.user.id, // Default to self if not set
            participants: participants || [],
            createdBy: req.user.id
        });

        res.json(newTask);
    } catch (err) {
        console.error("Error creating task:", err);
        console.error("Error details:", err.message, err.errors);
        res.status(500).json({ error: "Failed to create task", details: err.message });
    }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id);

        if (!task) return res.status(404).json({ error: "Task not found" });

        // Permission check: 
        // Super Admin can edit anything.
        // Creator can edit their task.
        // Assignee might be able to edit status? (Let's allow full edit for simpler logic if they are owner/assigned)
        if (req.user.role !== 'super-admin' && task.createdBy !== req.user.id && task.assignedTo !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to edit this task" });
        }

        await task.update(req.body);
        res.json(task);
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Failed to update task" });
    }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id);

        if (!task) return res.status(404).json({ error: "Task not found" });

        if (req.user.role !== 'super-admin' && task.createdBy !== req.user.id) {
            return res.status(403).json({ error: "Not authorized to delete this task" });
        }

        await task.destroy();
        res.json({ message: "Task deleted" });
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

module.exports = router;

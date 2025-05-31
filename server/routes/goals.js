const express = require('express');
const Goal = require('../models/Goal'); // Adjust path as needed
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all goals for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new goal
router.post('/', authenticateToken, async (req, res) => {
    const goal = new Goal({
        ...req.body,
        userId: req.user.id
    });
    try {
        const newGoal = await goal.save();
        res.status(201).json(newGoal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get a single goal
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.userId.toString() !== req.user.id) {
            return res.sendStatus(404);
        }
        res.json(goal);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a goal
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.userId.toString() !== req.user.id) {
            return res.sendStatus(404);
        }
        Object.assign(goal, req.body);
        const updatedGoal = await goal.save();
        res.json(updatedGoal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a goal
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.userId.toString() !== req.user.id) {
            return res.sendStatus(404);
        }
        await goal.remove();
        res.json({ message: 'Goal deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

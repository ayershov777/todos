const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Task = require('../models/Task');
const Goal = require('../models/Goal');

const router = express.Router();

// GET all tasks for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a single task by id (if owned by user)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.userId.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE a new task
router.post('/', authenticateToken, async (req, res) => {
    try {
        let { goalId, milestoneId } = req.body;
        let resolvedGoalId = goalId;

        // If milestoneId is provided, find the goal containing this milestone
        if (milestoneId) {
            const goal = await Goal.findOne({
                userId: req.user.id,
                'milestones._id': milestoneId
            });
            if (!goal) {
                return res.status(400).json({ error: 'Milestone not found for user' });
            }
            resolvedGoalId = goal._id;
        }

        const task = new Task({
            ...req.body,
            userId: req.user.id,
            goalId: resolvedGoalId || undefined,
            milestoneId: milestoneId || undefined
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE a task
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.userId.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Task not found' });
        }

        let { goalId, milestoneId } = req.body;
        let resolvedGoalId = goalId;

        if (milestoneId) {
            const goal = await Goal.findOne({
                userId: req.user.id,
                'milestones._id': milestoneId
            });
            if (!goal) {
                return res.status(400).json({ error: 'Milestone not found for user' });
            }
            resolvedGoalId = goal._id;
        }

        Object.assign(task, req.body, {
            goalId: resolvedGoalId || undefined,
            milestoneId: milestoneId || undefined
        });

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a task
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.userId.toString() !== req.user.id) {
            return res.status(404).json({ error: 'Task not found' });
        }
        await task.remove();
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

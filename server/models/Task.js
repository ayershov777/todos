const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    goalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal',
    },
    milestoneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal.milestones',
    },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;

const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
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
});

const goalSchema = new mongoose.Schema({
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
    targetDate: {
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
    milestones: [milestoneSchema],
});

const Goal = mongoose.model('Goal', goalSchema);
module.exports = Goal;

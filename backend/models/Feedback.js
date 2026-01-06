const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, required: true }, // Store name for display
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Bug', 'Feature Request', 'Improvement', 'Other', 'Software Issue', 'HR Issue', 'Project Issue', 'Workplace Issue']
    },
    attachment: {
        filename: String,
        data: Buffer,
        contentType: String
    },
    priority: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High']
    },
    status: {
        type: String,
        required: true,
        enum: ['Submitted', 'Pending', 'In Progress', 'Working', 'Resolved', 'Closed', 'Open', 'Declined'],
        default: 'Submitted'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    estimatedResolutionDate: {
        type: Date
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);

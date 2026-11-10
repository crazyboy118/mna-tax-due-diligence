const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema(
  {
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, default: 'General' },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Not Applicable'],
      default: 'Pending',
    },
    remarks: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChecklistItem', checklistSchema);

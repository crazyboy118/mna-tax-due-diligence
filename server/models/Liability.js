const mongoose = require('mongoose');

const liabilitySchema = new mongoose.Schema(
  {
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    title: { type: String, required: true, trim: true },
    taxType: {
      type: String,
      enum: ['Income Tax', 'GST', 'TDS', 'Transfer Pricing', 'Customs', 'Other'],
      default: 'Other',
    },
    assessmentYear: String,
    amount: { type: Number, required: true, min: 0 },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'Under Dispute', 'Resolved'], default: 'Open' },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Liability', liabilitySchema);

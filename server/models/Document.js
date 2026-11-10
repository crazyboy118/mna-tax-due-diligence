const mongoose = require('mongoose');

const CATEGORIES = [
  'Income Tax Return', 'GST Return', 'TDS', 'Audit Report',
  'Tax Notice', 'Assessment Order', 'Transfer Pricing', 'Other',
];

const documentSchema = new mongoose.Schema(
  {
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    taxYear: { type: String, trim: true }, // e.g. "FY 2022-23"
    originalName: String,
    fileName: String,
    mimeType: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
module.exports.CATEGORIES = CATEGORIES;

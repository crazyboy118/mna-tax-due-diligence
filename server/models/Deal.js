const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    targetCompany: { type: String, required: true, trim: true },
    buyerCompany: { type: String, required: true, trim: true },
    dealValue: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['Initiated', 'In Review', 'On Hold', 'Completed'],
      default: 'Initiated',
    },
    deadline: Date,
    description: String,
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deal', dealSchema);

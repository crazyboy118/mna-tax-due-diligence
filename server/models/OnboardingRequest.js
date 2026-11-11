const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true, maxlength: 120 },
    contactName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 30 },
    role: { type: String, enum: ['Buyer / Acquirer', 'Tax advisor', 'Law firm', 'PE / VC fund', 'Other'], default: 'Other' },
    dealVolume: { type: String, enum: ['1-2 deals a year', '3-10 deals a year', '10+ deals a year'], default: '1-2 deals a year' },
    taxAreas: [{ type: String, maxlength: 40 }],
    message: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['New', 'Contacted', 'Onboarded'], default: 'New' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OnboardingRequest', schema);
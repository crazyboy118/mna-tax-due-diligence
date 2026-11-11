const router = require('express').Router();
const OnboardingRequest = require('../models/OnboardingRequest');
const { protect, authorize } = require('../middleware/auth');

// Public: a prospective customer submits the onboarding form
router.post('/', async (req, res, next) => {
  try {
    const { company, contactName, email, phone, role, dealVolume, taxAreas, message, website } = req.body;
    if (website) return res.status(201).json({ ok: true }); // honeypot field
    if (!company || !contactName || !email)
      return res.status(400).json({ message: 'Company, contact name and email are required' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    await OnboardingRequest.create({
      company, contactName, email, phone, role, dealVolume, message,
      taxAreas: Array.isArray(taxAreas) ? taxAreas.slice(0, 6) : [],
    });
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

// Admin only: see requests and move them along
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try { res.json(await OnboardingRequest.find().sort('-createdAt')); } catch (err) { next(err); }
});

router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const r = await OnboardingRequest.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true, runValidators: true }
    );
    if (!r) return res.status(404).json({ message: 'Request not found' });
    res.json(r);
  } catch (err) { next(err); }
});

module.exports = router;
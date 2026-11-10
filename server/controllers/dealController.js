const Deal = require('../models/Deal');
const Document = require('../models/Document');
const ChecklistItem = require('../models/ChecklistItem');
const Liability = require('../models/Liability');
const defaultChecklist = require('../utils/defaultChecklist');

exports.createDeal = async (req, res, next) => {
  try {
    const { name, targetCompany, buyerCompany, dealValue, currency, deadline, description, team } = req.body;
    const deal = await Deal.create({
      name, targetCompany, buyerCompany, dealValue, currency, deadline, description,
      team: team || [], createdBy: req.user._id,
    });
    await ChecklistItem.insertMany(defaultChecklist.map((i) => ({ ...i, deal: deal._id })));
    res.status(201).json(deal);
  } catch (err) { next(err); }
};

exports.listDeals = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { $or: [{ createdBy: req.user._id }, { team: req.user._id }] };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const safe = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = new RegExp(safe, 'i');
    }
    res.json(await Deal.find(filter).populate('team', 'name email role').sort('-createdAt'));
  } catch (err) { next(err); }
};

exports.getDeal = async (req, res, next) => {
  try {
    res.json(
      await Deal.findById(req.deal._id)
        .populate('team', 'name email role')
        .populate('createdBy', 'name email')
    );
  } catch (err) { next(err); }
};

exports.updateDeal = async (req, res, next) => {
  try {
    const fields = ['name', 'targetCompany', 'buyerCompany', 'dealValue', 'currency',
      'status', 'deadline', 'description', 'team'];
    fields.forEach((f) => { if (req.body[f] !== undefined) req.deal[f] = req.body[f]; });
    await req.deal.save();
    res.json(req.deal);
  } catch (err) { next(err); }
};

exports.deleteDeal = async (req, res, next) => {
  try {
    await Promise.all([
      Document.deleteMany({ deal: req.deal._id }),
      ChecklistItem.deleteMany({ deal: req.deal._id }),
      Liability.deleteMany({ deal: req.deal._id }),
      req.deal.deleteOne(),
    ]);
    res.json({ message: 'Deal deleted' });
  } catch (err) { next(err); }
};

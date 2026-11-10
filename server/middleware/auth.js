const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Deal = require('../models/Deal');

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User no longer exists' });
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission for this action' });
  }
  next();
};

// Loads the deal from :dealId / :id and checks the user is admin, creator or team member
exports.dealAccess = async (req, res, next) => {
  try {
    const id = req.params.dealId || req.params.id;
    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    const uid = req.user._id.toString();
    const allowed =
      req.user.role === 'admin' ||
      deal.createdBy.toString() === uid ||
      deal.team.some((m) => m.toString() === uid);
    if (!allowed) return res.status(403).json({ message: 'You are not part of this deal' });
    req.deal = deal;
    next();
  } catch (err) {
    next(err);
  }
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const payload = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, token: sign(u._id) });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'Email already registered' });
    // first user in the system becomes admin; everyone else starts as reviewer
    const isFirst = (await User.countDocuments()) === 0;
    const user = await User.create({ name, email, password, role: isFirst ? 'admin' : 'reviewer' });
    res.status(201).json(payload(user));
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password || '')))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json(payload(user));
  } catch (err) { next(err); }
};

exports.me = (req, res) => res.json(req.user);

exports.listUsers = async (req, res, next) => {
  try { res.json(await User.find().sort('name')); } catch (err) { next(err); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { role: req.body.role }, { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

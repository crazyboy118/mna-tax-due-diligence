const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');

const uploadsDir = path.join(__dirname, '..', 'uploads');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const doc = await Document.create({
      deal: req.deal._id,
      category: req.body.category,
      taxYear: req.body.taxYear,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    });
    res.status(201).json(doc);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const filter = { deal: req.deal._id };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.taxYear) filter.taxYear = req.query.taxYear;
    res.json(await Document.find(filter).populate('uploadedBy', 'name').sort('-createdAt'));
  } catch (err) { next(err); }
};

// Files are served only through this route so deal access is always checked
exports.download = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.docId, deal: req.deal._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.download(path.join(uploadsDir, doc.fileName), doc.originalName);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.docId, deal: req.deal._id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    fs.unlink(path.join(uploadsDir, doc.fileName), () => {});
    res.json({ message: 'Document deleted' });
  } catch (err) { next(err); }
};

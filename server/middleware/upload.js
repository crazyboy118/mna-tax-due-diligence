const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const ALLOWED = ['.pdf', '.xls', '.xlsx', '.csv', '.doc', '.docx', '.png', '.jpg', '.jpeg'];

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) =>
    cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname).toLowerCase()),
});

module.exports = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ALLOWED.includes(ext) ? cb(null, true) : cb(new Error('File type not allowed'));
  },
});
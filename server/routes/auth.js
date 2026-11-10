const router = require('express').Router();
const c = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', protect, c.me);
router.get('/users', protect, c.listUsers);
router.put('/users/:id/role', protect, authorize('admin'), c.updateRole);

module.exports = router;

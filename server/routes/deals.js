const router = require('express').Router();
const deal = require('../controllers/dealController');
const docs = require('../controllers/documentController');
const child = require('../controllers/dealChildController');
const upload = require('../middleware/upload');
const { protect, authorize, dealAccess } = require('../middleware/auth');
const ChecklistItem = require('../models/ChecklistItem');
const Liability = require('../models/Liability');

const checklist = child(ChecklistItem, ['title', 'category', 'status', 'remarks', 'assignedTo']);
const liabilities = child(Liability, [
  'title', 'taxType', 'assessmentYear', 'amount', 'severity', 'status', 'description',
]);

router.use(protect);

// Deals
router.route('/')
  .get(deal.listDeals)
  .post(authorize('admin', 'lead_analyst'), deal.createDeal);
router.route('/:id')
  .get(dealAccess, deal.getDeal)
  .put(authorize('admin', 'lead_analyst'), dealAccess, deal.updateDeal)
  .delete(authorize('admin'), dealAccess, deal.deleteDeal);

// Documents
router.route('/:dealId/documents')
  .get(dealAccess, docs.list)
  .post(dealAccess, authorize('admin', 'lead_analyst'), upload.single('file'), docs.upload);
router.get('/:dealId/documents/:docId/download', dealAccess, docs.download);
router.delete('/:dealId/documents/:docId', dealAccess, authorize('admin', 'lead_analyst'), docs.remove);

// Checklist
router.route('/:dealId/checklist').get(dealAccess, checklist.list).post(dealAccess, checklist.create);
router.route('/:dealId/checklist/:itemId')
  .put(dealAccess, checklist.update)
  .delete(dealAccess, authorize('admin', 'lead_analyst'), checklist.remove);

// Liabilities
router.route('/:dealId/liabilities').get(dealAccess, liabilities.list).post(dealAccess, liabilities.create);
router.route('/:dealId/liabilities/:itemId')
  .put(dealAccess, liabilities.update)
  .delete(dealAccess, authorize('admin', 'lead_analyst'), liabilities.remove);

module.exports = router;

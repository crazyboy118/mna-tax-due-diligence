const Deal = require('../models/Deal');
const Liability = require('../models/Liability');
const ChecklistItem = require('../models/ChecklistItem');

exports.stats = async (req, res, next) => {
  try {
    const dealFilter = req.user.role === 'admin'
      ? {}
      : { $or: [{ createdBy: req.user._id }, { team: req.user._id }] };
    const deals = await Deal.find(dealFilter).select('name targetCompany status deadline');
    const ids = deals.map((d) => d._id);

    // Resolved liabilities are excluded from both exposure and the severity breakdown
    const openLiabilities = { deal: { $in: ids }, status: { $ne: 'Resolved' } };

    const [exposure, bySeverity, checklist] = await Promise.all([
      Liability.aggregate([
        { $match: openLiabilities },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Liability.aggregate([
        { $match: openLiabilities },
        { $group: { _id: '$severity', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      ]),
      ChecklistItem.aggregate([
        { $match: { deal: { $in: ids } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const done = checklist.find((c) => c._id === 'Completed')?.count || 0;
    const totalItems = checklist.reduce((s, c) => s + c.count, 0);
    const now = new Date();

    res.json({
      totalDeals: deals.length,
      dealsByStatus: deals.reduce((a, d) => ({ ...a, [d.status]: (a[d.status] || 0) + 1 }), {}),
      totalExposure: exposure[0]?.total || 0,
      openLiabilities: exposure[0]?.count || 0,
      riskBreakdown: bySeverity,
      checklistProgress: totalItems ? Math.round((done / totalItems) * 100) : 0,
      upcomingDeadlines: deals
        .filter((d) => d.deadline && d.deadline >= now && d.status !== 'Completed')
        .sort((a, b) => a.deadline - b.deadline)
        .slice(0, 5),
    });
  } catch (err) { next(err); }
};

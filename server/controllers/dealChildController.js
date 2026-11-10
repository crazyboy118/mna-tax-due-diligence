// Reusable CRUD for models that belong to a deal (checklist items, liabilities)
module.exports = (Model, allowedFields) => ({
  list: async (req, res, next) => {
    try {
      const filter = { deal: req.deal._id };
      ['status', 'severity', 'category', 'taxType'].forEach((k) => {
        if (req.query[k]) filter[k] = req.query[k];
      });
      res.json(await Model.find(filter).sort('createdAt'));
    } catch (err) { next(err); }
  },
  create: async (req, res, next) => {
    try {
      const data = { deal: req.deal._id, createdBy: req.user._id };
      allowedFields.forEach((f) => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
      res.status(201).json(await Model.create(data));
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      const item = await Model.findOne({ _id: req.params.itemId, deal: req.deal._id });
      if (!item) return res.status(404).json({ message: 'Item not found' });
      allowedFields.forEach((f) => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
      await item.save();
      res.json(item);
    } catch (err) { next(err); }
  },
  remove: async (req, res, next) => {
    try {
      const item = await Model.findOneAndDelete({ _id: req.params.itemId, deal: req.deal._id });
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
  },
});

const router = require('express').Router();
const ctrl = require('../controllers/warehouseController');
const tenantAuth = require('../middleware/tenantAuth');

router.use(tenantAuth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.get('/:id/stock', ctrl.stockSummary);

module.exports = router;

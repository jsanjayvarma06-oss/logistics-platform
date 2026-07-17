const router = require('express').Router();
const ctrl = require('../controllers/stockController');
const tenantAuth = require('../middleware/tenantAuth');

router.use(tenantAuth);

router.get('/product/:productId', ctrl.byProduct);
router.get('/warehouse/:warehouseId', ctrl.byWarehouse);
router.post('/add', ctrl.add);
router.post('/remove', ctrl.remove);
router.post('/reserve', ctrl.reserve);
router.get('/movements', ctrl.movements);

module.exports = router;

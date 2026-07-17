const router = require('express').Router();
const ctrl = require('../controllers/productController');
const tenantAuth = require('../middleware/tenantAuth');

router.use(tenantAuth);

router.get('/', ctrl.list);
router.get('/low-stock', ctrl.lowStock);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);

module.exports = router;

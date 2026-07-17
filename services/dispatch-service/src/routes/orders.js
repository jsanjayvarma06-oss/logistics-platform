const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const tenantAuth = require('../middleware/tenantAuth');

router.use(tenantAuth);

router.get('/dashboard', ctrl.dashboard);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);
router.post('/auto-plan', ctrl.autoPlan);

module.exports = router;

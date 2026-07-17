const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const tenantAuth = require('../middleware/tenantAuth');

router.get('/dashboard', tenantAuth, ctrl.dashboard);
router.get('/', tenantAuth, ctrl.list);
router.get('/:id/public', ctrl.getPublic); // no auth — for customer tracking
router.get('/:id', tenantAuth, ctrl.get);
router.post('/', tenantAuth, ctrl.create);
router.patch('/:id/status', tenantAuth, ctrl.updateStatus);
router.post('/auto-plan', tenantAuth, ctrl.autoPlan);
router.post('/route-optimize', tenantAuth, ctrl.routeOptimize);

module.exports = router;

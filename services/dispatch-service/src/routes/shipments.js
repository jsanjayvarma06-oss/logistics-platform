const router = require('express').Router();
const ctrl = require('../controllers/shipmentController');
const tenantAuth = require('../middleware/tenantAuth');

router.use(tenantAuth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.patch('/:id/stop', ctrl.updateStopStatus);

module.exports = router;

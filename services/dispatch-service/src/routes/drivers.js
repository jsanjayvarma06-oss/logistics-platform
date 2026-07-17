const router = require('express').Router();
const ctrl = require('../controllers/driverController');
const tenantAuth = require('../middleware/tenantAuth');

router.use(tenantAuth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);
router.patch('/:id/location', ctrl.updateLocation);

module.exports = router;

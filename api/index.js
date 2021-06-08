const router = require('express').Router();

router.use('/businesses', require('./businesses'));
router.use('/reviews', require('./reviews'));
router.use('/photos', require('./photos'));
router.use('/customers', require('./customers'));
router.use('/products', require('./products'));
module.exports = router;

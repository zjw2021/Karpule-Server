const express = require('express');
const router = express.Router();

const asyncHandler = require('../middleware/asyncHandler');
const authUser = require('../middleware/authUser');

router.use(authUser);

const {
    authorizeStripeUser,
    finalizeStripeUser,
    isAuthorizedUser,
    purchaseRide,
    completeRide
} = require('../controllers/stripe');

router.route('/authorize').get(authorizeStripeUser)
router.route('/finalize').post(finalizeStripeUser)
router.route('/isauthorized').get(isAuthorizedUser)
router.route('/purchaseride').post(purchaseRide)
router.route('/completeride').put(completeRide)

module.exports = router;
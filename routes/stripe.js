const express = require('express');
const router = express.Router();

const asyncHandler = require('../middleware/asyncHandler');
const authUser = require('../middleware/authUser');

router.use(authUser);

const {
    authorizeStripeUser,
    isAuthorizedUser,
    testMiddle
} = require('../controllers/stripe');

router.route('/authorize').get(authorizeStripeUser)
router.route('/isauthorized').post(isAuthorizedUser)
router.route('/test').get(testMiddle)

module.exports = router;
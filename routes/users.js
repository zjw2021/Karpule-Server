
const express = require('express');
const router = express.Router();

const { 
    registerUser,
    loginUser,
    registerDriver,
    getDriverRides,
    getUser,
    loginWithToken
} = require('../controllers/users')

router.route('/:id').get(getUser)

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

router.route('/rides/:id').get(getDriverRides)

router.route('/:id').put(registerDriver)

router.route('/loginwithtoken').post(loginWithToken);

module.exports = router;
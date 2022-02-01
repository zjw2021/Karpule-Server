
const express = require('express');
const router = express.Router();

const { 
    registerUser,
    loginUser,
    registerDriver,
    getUser
} = require('../controllers/users')

router.route('/:id').get(getUser)

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

router.route('/:id').put(registerDriver)

module.exports = router;
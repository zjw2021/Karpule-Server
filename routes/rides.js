
const express = require('express');
const router = express.Router();

const optAuthUser = require('../middleware/optAuthUser')

router.use(optAuthUser);

const { 
    getRides,
    getRide,
    createRide,
    editRide,
    deleteRide,
    completeRide,
    requestRide,
    acceptRequest,
    joinRide,
    leaveRide
} = require('../controllers/rides')

router.route('/').get(getRides)
router.route('/get/:id').get(getRide)

router.route('/create/:id').post(createRide)
router.route('/edit/:id').put(editRide)
router.route('/delete/:id').delete(deleteRide)

router.route('/requestride/:id').post(requestRide)
router.route('/acceptrequest/:id').post(acceptRequest)

router.route('/join/:id').put(joinRide)
router.route('/leave/:id').post(leaveRide)

module.exports = router;

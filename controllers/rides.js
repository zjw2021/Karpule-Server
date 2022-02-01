
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

// const JWT_SECRET = "secret"

const User = require('../models/User')
const Ride = require('../models/Ride')
const asyncHandler = require('../middleware/asyncHandler')

exports.getRides = asyncHandler(async (req, res, next) => {
    const rides = await Ride.find()
    res.json({ rides })
})

exports.getRide = asyncHandler(async (req, res, next) => {
    const ride = await Ride.findById(req.params.id)
    res.status(200).json(ride)
})

// Ride Driver Controllers
exports.createRide = asyncHandler(async (req, res, next) => {

    //get token, and search user by id from token
    const driver = req.params.id

    const {
        destination,
        pickupLocation,
        pickupTime,
        seatLimit,
        seatFee
    } = req.body

    let user = User.findById(driver)

    if (!user) return res.status(400).json("No user");

    const ride = new Ride({
        driver,
        destination,
        pickupLocation,
        pickupTime,
        seatLimit,
        seatFee
    });

    await ride.save();

    user = await User.findByIdAndUpdate(driver, { ride: ride._id})
    await user.save()
    console.log(ride)
    console.log(user)

    res.json({ ride })
})

exports.editRide = asyncHandler(async (req, res, next) => {
    let ride = await Ride.findById(req.params.id)

    if (!ride) {
        return next(new ErrorResponse("No ride found", 404))
    }

    ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json(ride)
})

exports.deleteRide = asyncHandler(async (req, res, next) => {
    await Ride.findByIdAndDelete(req.params.id);
    res.status(200).json(`Ride ${req.params.id} has been deleted`);
})

exports.completeRide = asyncHandler(async (req, res, next) => {
    let ride = await Ride.findById(req.params.id)

    if (!ride) {
        return next(new ErrorResponse("No ride found", 404))
    }

    ride = await Ride.findByIdAndUpdate(req.params.id, {isComplete: true}, {
        new: true,
        runValidators: true
    })

    res.status(200).json(ride)
})

// Ride Rider Controllers
exports.joinRide = asyncHandler(async (req, res, next) => {
    // get ride
    const ride = await Ride.findById(req.params.id)

    // const { token } = req.body

    const rider = req.body

    await ride.passengers.push(rider);
    await ride.save();

    res.json({ ride })
})

exports.leaveRide = asyncHandler(async (req, res, next) => {
    const ride = await Ride.findById(req.params.id)

    const rider = req.body

    await ride.passengers.pull(rider);
    await ride.save();

    res.json({ ride })
})
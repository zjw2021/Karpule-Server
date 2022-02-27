
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

// const JWT_SECRET = "secret"

const User = require('../models/User')
const Ride = require('../models/Ride')
const asyncHandler = require('../middleware/asyncHandler')

exports.getRides = asyncHandler(async (req, res, next) => {
    const rides = await Ride.find();
    const incompleteRides = rides.filter((ride) => { !ride.isComplete });
    res.json({ rides: incompleteRides });
})

exports.getRide = asyncHandler(async (req, res, next) => {
    const ride = await Ride.findById(req.params.id)
    res.status(200).json(ride)
})

// Ride Driver Controllers
exports.createRide = asyncHandler(async (req, res, next) => {
    //get token, and search user by id from token
    const driver = req.params.id;

    const {
        destination,
        pickupLocation,
        pickupTime,
        seatLimit,
        seatFee
    } = req.body

    let user = await User.findById(driver)

    if (!user) return res.status(400).json("No user");
    const requirements = [
        { name: "isDriver", field: user.isDriver, desc: "Car details have not been filled out" },
        { name: "verified", field: user.driverVerified, desc: "Driver not verified by Karpule" },
        { name: "carDrive", field: user.canDrive, desc: "Driver cannot earn money from rides (please complete Stripe)" }
    ];

    console.log(user);
    for (const requirement of requirements) {
        if (!requirement.field) {
            console.log(requirement.name);
            console.log(requirement.desc);
            return res.status(400).json(requirement.desc);
        }
    }

    const ride = new Ride({
        driver,
        destination,
        pickupLocation,
        pickupTime,
        seatLimit,
        seatFee,
        passengers: []
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

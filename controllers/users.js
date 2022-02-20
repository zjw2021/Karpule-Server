const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = "secret"

const User = require('../models/User')
const Ride = require('../models/Ride')
const asyncHandler = require('../middleware/asyncHandler')

exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    res.status(200).json(user)
})

exports.registerUser = asyncHandler(async (req, res, next) => {
    //Destructure request body
    const { firstName, lastName, email, password, carModel, carPlate, carColor } = req.body;

    let user = await User.findOne({ email });

    //Check to see if user already exists
    if (user) {
        return res.status(400).send('User already exists');
    }

    user = new User({ firstName,
                      lastName,
                      email,
                      password,
                      carModel: carModel ?? "",
                      carPlate: carPlate ?? "",
                      carColor: carColor ?? ""});

    //Salt password with bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    try {
        if (carModel.length !== 0 && carPlate.length !== 0 && carColor.length !== 0) {
            user.isDriver = true;
        }
        else {
            user.isDriver = false;
        }
    }
    catch (e) {
        console.warn("One of carModel, carPlate, carColor was not a string:\n" + e);
    }
    finally {
        //Save admin to database
        await user.save();

        const payload = { user: { id: user.id } };

        //Sign token and set expiration to 10 minutes
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 600 });
        // res.header('x-auth-token', token).send(token);
        res.json({ user, token })
    }
})

exports.loginUser = asyncHandler(async (req, res, next) => {
    //Deconstruct request body
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    //Check if admin account is valid otherwise return error
    if (!user) {
        return res.status(400).json("User doesn't exist");
    }

    //Compare hashed password to entered password
    const passwordMatch = await bcrypt.compare(password, user.password);

    //Check if passwords match otherwise return error
    if (!passwordMatch) {
        return res.status(400).json("Incorrect password")
    }

    const payload = { user: { id: user.id } };

    //Sign token and set expiration to 10 minutes
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 600 });
    // res.header('x-auth-token', token).send(token);
    res.json({ user, token })
})

exports.getDriverRides = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
        return res.sendStatus(401);
    }

    if (user.isDriver) {
        const rides = await Ride.find({ driver: userId });
        return res.json(rides);
    }
    else {
        return res.sendStatus(403);
    }
});

exports.registerDriver = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorResponse("No user found", 404))
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json(user)
})

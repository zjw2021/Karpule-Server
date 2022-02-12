const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(/* CLIENT KEY */'')

const JWT_SECRET = "secret"

const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler')

exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    res.status(200).json(user)
})

exports.registerUser = asyncHandler(async (req, res, next) => {
    //Destructure request body
    const { email, password, carModel, carPlate, carColor } = req.body;

    let user = await User.findOne({ email });

    //Check to see if user already exists
    if (user) {
        return res.status(400).send('User already exists');
    }

    //Register the user with stripe
    const userStripeAccount = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        default_currency: 'usd',
        capabilities: {
            card_payments: {requested: true},
            transfers: {requested: true}
        },
        business_type: 'individual',
        business_profile: {
            product_description: "Driver or passenger"
        },
        company: {
            address: {
                city: 'Wellesley',
                country: 'US',
                line1: '231 Forest St',
                postal_code: '02457',
                state: 'MA'
            }
        },
        email
    })

    console.log(userStripeAccount);

    const stripeId = userStripeAccount.id;

    user = new User({ email,
                      password,
                      carModel: carModel ?? "",
                      carPlate: carPlate ?? "",
                      carColor: carColor ?? "",
                      stripeId,
                      stripeComplete: false});

    //Salt password with bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    //Save admin to database
    await user.save();

    const payload = { user: { id: user.id } };

    //Sign token and set expiration to 10 minutes
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 600 });
    // res.header('x-auth-token', token).send(token);
    res.json({ user, token })
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

const querystring = require('querystring');
const process = require('process');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const asyncHandler = require('../middleware/asyncHandler');

const User = require('../models/User')
const Ride = require('../models/Ride')

// Redirects to Stripe to set up payments, connecting the account to Stripe
// Takes in a user token
exports.authorizeStripeUser = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const firstName = user.firstName;
    const lastName = user.lastName;

    const stripeClientId = process.env.STRIPE_CLIENT_ID;
    // Stripe did this in their example: protects from CSRF
    const sessionState = Math.random().toString(36).slice(2);
    const jwt = req.header('x-auth-token');

    // So that on the redirect, the jwt will be included
    const sendState = sessionState + ":" + jwt;
    const parameters = {
        client_id: stripeClientId,
        state: sendState,
        'capabilities[card_payments][requested]': 'true',
        'capabilities[transfers][requested]': 'true',
        'stripe_user[email]': user.email,
        'stripe_user[country]': 'US',
        'stripe_user[phone_number]': '0000000000',
        'stripe_user[business_type]': 'individual',
        'stripe_user[first_name]': firstName,
        'stripe_user[last_name]': lastName,
        'stripe_user[dob_day]': '1',
        'stripe_user[dob_month]': '1',
        'stripe_user[dob_year]': '2000',
        'stripe_user[default_currency]': 'usd',
        'stripe_user[product_description]': 'driver/passenger'
    }
    const stripeAuthorizeUri = 'https://connect.stripe.com/express/oauth/authorize';
    res.json({ "url": stripeAuthorizeUri + '?' + querystring.stringify(parameters)});
});

// Checks if a given user is authorized with Stripe (has completed their flow)
exports.isAuthorizedUser = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
        res.sendStatus(401);
    }

    res.status(200).json({ complete: user.canRide });
});

// Finalizes Stripe user authorization
exports.finalizeStripeUser = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    // The authorization code returned by Stripe on redirect
    const code = req.body.code;
    console.log(req);

    const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code,
    });

    const userStripeId = response.stripe_user_id;
    const userStripeAccount = await stripe.accounts.retrieve(userStripeId);
    // Successfully completed necessary rider fields for Stripe
    const canRide = userStripeAccount.details_submitted;
    // Successfully completed necessary driver fields for Stripe (can earn money)
    const canDrive = userStripeAccount.requirements.eventually_due.length === 0;

    user.stripeId = userStripeId;
    user.canRide = canRide;
    user.canDrive = canDrive;

    // Creates a Stripe Customer object so that they can pay
    const customer = await stripe.customers.create({
        email: user.email,
        metadata: { 'stripeAccId': userStripeId }
    });

    user.stripeCustomerId = customer.id;

    const updatedUser = await User.findByIdAndUpdate(userId, user);

    return res.sendStatus(200);
});

// Purchases a ride with the given user
exports.purchaseRide = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const rideId = req.body.ride._id;
    const user = await User.findById(userId);
    const ride = await Ride.findById(rideId);

    if (ride.passengers.length >= ride.seatLimit) {
        return res.status(400).json("Ride is full");
    }

    const rideName = `Ride with ${user.firstName}`;
    const rideDate = new Date(ride.date);
    const rideDateDesc = rideDate.toDateString();
    const rideDesc = `A ride at ${ride.pickupTime} with ${user.firstName} on ${rideDateDesc}.`;

    // Create a purchasable Stripe product
    const rideProduct = await stripe.products.create({
        name: rideName,
        description: rideDesc,
    });

    const rideProductId = rideProduct.id;

    const ridePrice = await stripe.prices.create({
        unit_amount: ride.seatFee,
        currency: 'usd',
        product: rideProductId,
    });

    const ridePriceId = ridePrice.id;

    // The payment session for Stripe Checkouts, where the user will pay
    const session = await stripe.checkout.sessions.create({
        success_url: 'http://localhost:3000/purchasesuccess',
        cancel_url: 'http://localhost:3000/purchasecancel',
        line_items: [
            { price: ridePriceId, quantity: 1 }
        ],
        mode: 'payment',
        customer: user.stripeCustomerId,
    });

    const sessionUrl = session.url;
    res.redirect(sessionUrl);
});

const querystring = require('querystring');
const stripe = require('stripe')(/* CLIENT KEY */"")

const asyncHandler = require('../middleware/asyncHandler');

const User = require('../models/User')

// Redirects to Stripe to set up payments, connecting the account to Stripe
// Takes in a user token
exports.authorizeStripeUser = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const userStripeId = user.stripeId;

    // const accountLink = await stripe.accountLinks.create({
    //     account: userStripeId,
    //     refresh_url: 'http://localhost:3000/',
    //     return_url: 'http://localhost:3000/login',
    //     type: 'account_onboarding'
    // });

    // return res.status(200).json({ url: accountLink.url });

    const stripeClientId = /* CLIENT_ID */"";
    // Stripe did this in their example: protects from CSRF
    const sessionState = Math.random().toString(36).slice(2);
    const parameters = {
        client_id: stripeClientId,
        state: sessionState,
        redirect_uri: 'localhost:3000/api/user/token',
        'capabilities[card_payments][requested]': 'true',
        'capabilities[transfers][requested]': 'true',
        'stripe_user[email]': user.email,
        'stripe_user[country]': 'US',
        'stripe_user[phone_number]': '0000000000',
        'stripe_user[business_type]': 'individual',
        'stripe_user[first_name]': 'John',
        'stripe_user[last_name]': 'Anon',
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

    res.status(200).json({ complete: user.stripeComplete });
});

// Determines if the user is authorized with Stripe and updates the user accordingly
exports.updateAuth = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const userStripeId = user.stripeId;
    const userStripeAccount = stripe.accounts.retrieve(userStripeId);

    // TODO: find out how to distinguish between authenticated and non-authenticated accounts
});

exports.testMiddle = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const userStripeId = user.stripeId;
    const userStripeAccount = await stripe.accounts.retrieve(userStripeId);
    console.log(userStripeAccount);
    res.sendStatus(200);
});
const { Schema, model } = require('mongoose');

const userSchema = new Schema ({
    firstName: {
        type: String,
        required: [true, 'Please enter your first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please enter your last name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please enter your password']
    },
    carModel: {
        type: String,
    },
    carPlate: {
        type: String,
    },
    carColor: {
        type: String,
    },
    ride: {
       type: String, 
       default: ""
    },
    date: {
        type: Date,
        default: Date.now()
    },
    // The user's Stripe ID to their Stripe account
    stripeId: {
        type: String,
        default: null
    },
    // The user's Stripe customer ID for payments
    stripeCustomerId: {
        type: String,
        default: null
    },
    // Did the user self-declare as a driver (i.e. filled out car fields)?
    isDriver: {
        type: Boolean,
        default: false
    },
    // Has the user manually been verified as a driver (i.e. taken the driver's test and sent
    // ID card/license?)
    driverVerified: {
        type: Boolean,
        default: false
    },
    // Has the user filled out all the necessary Stripe fields to pay for rides?
    canRide: {
        type: Boolean,
        default: false
    },
    // Has the user filled out all the necessary Stripe fields to earn money from rides?
    canDrive: {
        type: Boolean,
        default: false
    }
});

const User = model('users', userSchema);

module.exports = User;

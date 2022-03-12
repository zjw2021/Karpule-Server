
const { Schema, model } = require('mongoose');

const rideSchema = new Schema ({
    driver: {
        type: String
    },
    destination: {
        type: String,
        required: [true, 'Please add a destination']
    },
    pickupLocation: {
        type: String,
        required: [true, 'Please add a pickup location']
    },
    pickupTime: {
        type: String,
        required: [true, 'Please add a pickup time']
    },
    seatLimit: {
        type: Number,
        required: [true, 'Please add a seat limit']
    },
    seatFee: {
        type: Number,
        required: [true, 'Please add a seat fee']
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    requested: {
        type: Array,
        default: []
    },
    awaitingPayment: {
        type: Array,
        default: []
    },
    passengers: {
        type: Array,
        default: []
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

const Ride = model('rides', rideSchema);

module.exports = Ride;
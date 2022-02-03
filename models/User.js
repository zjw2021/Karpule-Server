
const { Schema, model } = require('mongoose');

const userSchema = new Schema ({
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
    isDriver: {
        type: Boolean,
        default: false
    },
    ride: {
       type: String, 
       default: ""
    },
    date: {
        type: Date,
        default: Date.now()
    },
    stripeId: {
        type: String,
        default: null
    }
});

const User = model('users', userSchema);

module.exports = User;
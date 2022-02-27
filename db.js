const mongoose = require('mongoose');
const process = require('process');
// require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    // Create connection between mongodb and mongoose
    const connection = await 
        mongoose.connect(MONGO_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true
        });
    console.log(`Database Connected: ${connection.connection.host}`)
};

module.exports = connectDB;

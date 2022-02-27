const express = require('express')
const _ = require('dotenv').config();
const app = express()

// Connect database to server
const connectDB = require('./db');
connectDB();

// Enable body parser
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Backedn")
})

const users = require('./routes/users');
app.use('/api/users', users);

const rides = require('./routes/rides');
app.use('/api/rides', rides);

const stripe = require('./routes/stripe');
app.use('/api/stripe', stripe);

const PORT = 9000
app.listen(PORT, console.log('Karpule backend listening on part ' + PORT))


const jwt = require('jsonwebtoken');
const JWT_SECRET = "secret"

module.exports = function(req, res, next){

    //Grab JWT token from headers
    const token = req.header('x-auth-token');

    if(!token) return res.status(401).json('No token');

    try {
        jwt.verify(token, JWT_SECRET); 
        // req.volunteer = verified.volunteer;
        next()
    } catch (err) {
        res.status(400).json('Invalid token')
    }
    next()
}
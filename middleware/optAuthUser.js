const jwt = require('jsonwebtoken');
const JWT_SECRET = "secret"

module.exports = function(req, res, next){
    //Grab JWT token from headers
    const token = req.header('x-auth-token');

    if(!token) {
        next();
        return;
    }

    console.log("HAS TOKEN");

    jwt.verify(token, JWT_SECRET, (err, info) => {
        if (err) {
            console.log("THERE'S AN ERROR")
            console.log(err);
            next();
            return;
        }
        console.log(info.user);
        req.user = info.user;
        next();
    });
}
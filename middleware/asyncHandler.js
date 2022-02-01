
// I got this from https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
const asyncHandler = func => (req, res, next) => {
    Promise.
        resolve(func(req, res, next))
        .catch(next)
}

module.exports = asyncHandler
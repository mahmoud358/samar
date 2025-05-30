const jwt = require("jsonwebtoken")
const Uitl = require("util")
const APIERROR = require("../utils/apiError")
exports.auth = async function (req, res, next) {
    let { authorization } = req.headers
    if (!authorization) {
        next(new APIERROR(401, 'Authorization header is required You must be login'))
    }
    try {
        let decoded = await Uitl.promisify(jwt.verify)(authorization, process.env.SECRET)
        // console.log(decoded);

        req.id = decoded._id
        req.role = decoded.role
        // console.log(decoded.role);



        next()

    } catch (error) {
        next(new APIERROR(400, 'Invalid token'))

    }

}
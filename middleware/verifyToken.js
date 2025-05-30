
const jwt = require("jsonwebtoken");
const Uitl = require("util")


const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).send({ auth: false, message: "No token provided." })
    }



    try {
        const currentUser = await Uitl.promisify(jwt.verify)(authHeader, process.env.SECRET);
        req.id = currentUser.userId;
        req.role = currentUser.userRole
        console.log(currentUser);
        next();
    } catch (err) {
        return res.status(401).json({ auth: false, message: "Failed to authenticate token." })
    }
}


module.exports = verifyToken;

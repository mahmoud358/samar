module.exports = (...roles) => {

    return (req, res, next) => {

        console.log("roles", roles);


        if (!roles.includes(req.role)) {
            return next(res.json({ status: "fail", message: "You are not authorized " }))
        }
        next();
    }
}
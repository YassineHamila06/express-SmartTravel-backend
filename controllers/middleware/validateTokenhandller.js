const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error("Not authorized, token failed");
            }

            console.log(decoded);
            req.user = decoded; // Store decoded user info in `req.user`
            next(); // Call next middleware
        });
    } else {
        res.status(401).json({ message: "No token, authorization denied" });
    }
});

module.exports = validateToken;

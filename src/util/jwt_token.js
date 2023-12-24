const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config/config");

function createToken(data) {
    return jwt.sign(data, JWT_SECRET_KEY)
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET_KEY);
}


module.exports = { createToken, verifyToken }
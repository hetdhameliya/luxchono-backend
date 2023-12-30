const { verifyToken } = require("../util/jwt_token");
const ApiError = require("../util/error");

function verifyUser(role) {
    return async (req, _res, next) => {
        try {
            const authorization = req.headers["authorization"];
            if (!authorization) {
                return next(new ApiError(401, "Unauthorized user"));
            }
            const token = authorization.split(" ")[1];
            if (!token) {
                return next(new ApiError(401, "Unauthorized user"));
            }
            const data = verifyToken(token);
            if (typeof role === "string") {
                if (data.role === role) {
                    req.id = data._id;
                    req.role = data.role;
                    return next();
                }
            } else {
                if (role.includes(data.role)) {
                    req.id = data._id;
                    req.role = data.role;
                    return next();
                }
            }
            return next(new ApiError(401, "Unauthorized user"));
        } catch (e) {
            return next(new ApiError(401, "Unauthorized user"));
        }
    }
}

module.exports = { verifyUser };
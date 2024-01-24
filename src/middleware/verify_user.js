const { verifyToken } = require("../util/jwt_token");
const ApiError = require("../util/error");
const UserModel = require("../model/user_model");
const AdminModel = require("../model/admin/admin_model");
const { USER_ROLE, ADMIN_ROLE } = require("../config/string");

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
                    if (role === USER_ROLE) {
                        const findUser = await UserModel.findById(data._id);
                        if (findUser) {
                            req.id = data._id;
                            req.role = data.role;
                            req.user = findUser;
                            return next();
                        } else {
                            return next(new ApiError(401, "Unauthorized user"));
                        }
                    } else if (role === ADMIN_ROLE) {
                        const findAdmin = await AdminModel.findById(data._id);
                        if (findAdmin) {
                            req.id = data._id;
                            req.role = data.role;
                            req.user = findAdmin;
                            return next();
                        } else {
                            return next(new ApiError(401, "Unauthorized user"));
                        }
                    }
                    return next(new ApiError(401, "Unauthorized user"));
                }
            } else {
                if (role.includes(data.role)) {
                    if (data.role === USER_ROLE) {
                        const findUser = await UserModel.findById(data._id);
                        if (findUser) {
                            req.id = data._id;
                            req.role = data.role;
                            req.user = findUser;
                            return next();
                        } else {
                            return next(new ApiError(401, "Unauthorized user"));
                        }
                    } else if (data.role === ADMIN_ROLE) {
                        const findAdmin = await AdminModel.findById(data._id);
                        if (findAdmin) {
                            req.id = data._id;
                            req.role = data.role;
                            req.user = findAdmin;
                            return next();
                        } else {
                            return next(new ApiError(401, "Unauthorized user"));
                        }
                    }
                    return next(new ApiError(401, "Unauthorized user"));
                }
            }
            return next(new ApiError(401, "Unauthorized user"));
        } catch (e) {
            return next(new ApiError(401, "Unauthorized user"));
        }
    }
}

module.exports = { verifyUser };
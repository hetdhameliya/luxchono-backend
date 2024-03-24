const { verifyToken } = require("../util/jwt_token");
const ApiError = require("../util/error");
const UserModel = require("../model/user_model");
const { ADMIN_ROLE, SUPER_ADMIN_ROLE } = require("../config/string");

async function verifyUser(req, _res, next) {
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
        const findUser = await UserModel.findById(data._id);
        if (!findUser) {
            return next(new ApiError(401, "Unauthorized user"));
        }
        req.id = findUser._id;
        req.role = findUser.role;
        req.user = findUser;
        return next();
    } catch (e) {
        return next(new ApiError(401, "Unauthorized user"));
    }
}

async function verifyAdmin(req, _res, next) {
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
        const findUser = await UserModel.findOne({ _id: data._id, role: { $in: [ADMIN_ROLE, SUPER_ADMIN_ROLE] } });
        if (!findUser) {
            return next(new ApiError(401, "Unauthorized user"));
        }
        if (!findUser.isVerified) {
            return next(new ApiError(401, "Email is not verified"));
        }
        if (!findUser.isAdminVerified) {
            return next(new ApiError(401, "Admin is not verfied by super admin"));
        }
        req.id = findUser._id;
        req.role = findUser.role;
        req.user = findUser;
        return next();
    } catch (e) {
        return next(new ApiError(401, "Unauthorized user"));
    }
}

async function verifySuperAdmin(req, _res, next) {
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
        const findUser = await UserModel.findOne({ _id: data._id, role: SUPER_ADMIN_ROLE });
        if (!findUser) {
            return next(new ApiError(401, "This email super admin is not exist"));
        }
        req.id = findUser._id;
        req.role = findUser.role;
        req.user = findUser;
        return next();
    } catch (e) {
        return next(new ApiError(401, "Unauthorized user"));
    }
}

async function notificationMiddleware(req, _res, next) {
    try {
        const authorization = req.headers["authorization"];
        if (!authorization) {
            return next();
        }
        const token = authorization.split(" ")[1];
        if (!token) {
            return next();
        }
        const data = verifyToken(token);
        const findUser = await UserModel.findOne({ _id: data._id, role: SUPER_ADMIN_ROLE });
        if (!findUser) {
            return next(new ApiError(401, "This email super admin is not exist"));
        }
        req.id = findUser._id;
        req.role = findUser.role;
        req.user = findUser;
        return next();
    } catch (e) {
        next();
    }
}

module.exports = { verifyUser, verifyAdmin, verifySuperAdmin, notificationMiddleware };
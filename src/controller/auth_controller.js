const UserModel = require("../model/user_model");
const OtpModel = require("../model/otp_model");
const ApiError = require("../util/error");
const { generateOtp } = require("../util/utils");
const transporter = require("../util/transporter");
const fs = require("fs");
const path = require("path");
const { comparePassword } = require("../util/hash");
const { createToken } = require("../util/jwt_token");
const { USER_ROLE, PUBLIC_NOTIFICATION, PRIVATE_NOTIFICATION } = require("../config/string");
const { USER_RESET_PASSWORD_ROUTE, ADMIN_RESET_PASSWORD_ROUTE } = require("../config/config");
const NotificationModel = require("../model/notification_model");

async function verifyEmail(req, res, next) {
  try {
    const { email } = req.body;
    const filePath = path.join(__dirname, "../../public/otp.html");
    let htmlData = fs.readFileSync(filePath, "utf-8");
    const otp = generateOtp();
    htmlData = htmlData.replace("${otp}", otp);
    transporter.sendMail(
      {
        to: email,
        subject: "Verify email",
        html: htmlData,
      },
      async (err, _result) => {
        if (err) {
          return next(new ApiError(400, err.message));
        }
        await OtpModel.deleteMany({ email: email });
        const otpModel = new OtpModel({ email, otp });
        await otpModel.save();
        setTimeout(async () => {
          await OtpModel.findByIdAndDelete(otpModel._id);
        }, 1000 * 60);
        res.status(200).json({
          statusCode: 200,
          success: true,
          message: "Otp send your email",
        });
      }
    );
  } catch (e) {
    next(new ApiError(400, e.message));
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const findOtp = await OtpModel.findOne({ email });
    if (!findOtp) {
      return next(new ApiError(400, "Otp Expired"));
    }
    if (findOtp.otp !== otp) {
      return next(new ApiError(400, "Otp is wrong"));
    }
    await OtpModel.deleteMany({ email: email });
    res
      .status(200)
      .json({ statusCode: 200, success: true, message: "Otp is Verified" });
  } catch (e) {
    next(new ApiError(400, e.message));
  }
}

async function register(req, res, next) {
  try {
    const { email } = req.body;
    const findUser = await UserModel.findOne({ email });
    if (findUser) {
      return next(new ApiError(400, "User alerdy Exist"));
    }
    const user = new UserModel({ ...req.body, role: USER_ROLE });
    await user.save();
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Register successfully",
    });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const findUser = await UserModel.findOne({ email });
    if (!findUser) {
      return next(new ApiError(400, "Email is not exist"));
    }
    const match = comparePassword(password, findUser.password);
    if (!match) {
      return next(new ApiError(400, "Password is wrong"));
    }
    const token = createToken({
      _id: findUser._id,
      role: USER_ROLE,
      email: findUser.email,
    });
    res.status(200).json({
      statusCode: 200,
      success: true,
      token,
      message: "login successfully",
    });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const findUser = await UserModel.findOne({ email });
    if (!findUser) {
      return next(new ApiError(400, "This email user not exist"));
    }
    const filePath = path.join(__dirname, "../../public/reset_password.html");
    let htmlData = fs.readFileSync(filePath, "utf-8");
    if (findUser.role === USER_ROLE) {
      htmlData = htmlData.replace(
        "${resetPasswordLink}",
        `${USER_RESET_PASSWORD_ROUTE}?id=${findUser._id}`
      );
    } else {
      htmlData = htmlData.replace(
        "${resetPasswordLink}",
        `${ADMIN_RESET_PASSWORD_ROUTE}?id=${findUser._id}`
      );
    }
    transporter.sendMail(
      {
        to: email,
        subject: "Reset password",
        html: htmlData,
      },
      async (err, _result) => {
        if (err) {
          return next(new ApiError(400, err.message));
        }
        res.status(200).json({
          statusCode: 200,
          success: true,
          message: "Reset password mail send to your email",
        });
      }
    );
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function resetPassword(req, res, next) {
  try {
    const id = req.query.id;
    const { newPassword } = req.body;
    if (!id) {
      return next(new ApiError(400, "User id is required"));
    }
    if (!newPassword) {
      return next(new ApiError(400, "Password is required"));
    }
    const findUser = await UserModel.findById(id);
    if (!findUser) {
      return next(new ApiError(400, "User is not exist"));
    }
    findUser.password = newPassword;
    await findUser.save({ validateBeforeSave: true });
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Password change successfully",
    });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function idToEmail(req, res, next) {
  try {
    const id = req.query.id;
    if (!id) {
      return next(new ApiError(400, "User id is required"));
    }
    const findUser = await UserModel.findById(id);
    if (!findUser) {
      return next(new ApiError(400, "User is not exist"));
    }
    res.status(200).json({
      statusCode: 200,
      success: true,
      data: { email: findUser.email },
    });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function changePassword(req, res, next) {
  try {
    const { password, newPassword } = req.body;
    const findUser = await UserModel.findById(req.user._id);
    if (!findUser) {
      return next(new ApiError(400, "Email is not exist"));
    }
    const match = comparePassword(password, findUser.password);
    if (!match) {
      return next(new ApiError(400, "Old password is wrong"));
    }
    const newPasswordMatch = comparePassword(newPassword, findUser.password);
    if (newPasswordMatch) {
      return next(new ApiError(400, "This password is alreay used by you"));
    }
    findUser.password = newPassword.trim();
    await findUser.save({ validateBeforeSave: true });
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Password change successfully",
    });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function profile(req, res, next) {
  try {
    const findUser = await UserModel.findById(req.id).select(
      "-password -isVerified -isAdminVerified -publicId"
    );
    res.status(200).json({ statusCode: 200, success: true, data: findUser });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function editProfile(req, res, next) {
  try {
    req.user.username = req.body.username ?? req.user.username;
    req.user.phoneNo = req.body.phoneNo ?? req.user.phoneNo;
    await req.user.save();
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "profile update successfully",
    });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function getAllNotification(req, res, next) {
  try {
    let filter = {
      $or: [
        { type: PUBLIC_NOTIFICATION },
      ]
    };
    if(req.id) {
      filter.$or.push(
        { $and: [{ user: req.id }, { type: PRIVATE_NOTIFICATION }] }
      );
    }

    const notifications = await NotificationModel.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ statusCode: 200, success: true, message: 'Get all user notification', data: notifications });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

module.exports = { verifyEmail, verifyOtp, register, login, changePassword, forgotPassword, resetPassword, idToEmail, profile, editProfile, getAllNotification };

const UserModel = require("../model/user_model");
const OtpModel = require("../model/otp_model");
const ApiError = require("../util/error");
const generateOtp = require("../util/generate_otp");
const transporter = require("../util/transporter");
const fs = require("fs");
const path = require("path");
const { comparePassword } = require("../util/hash");
const { createToken } = require("../util/jwt_token");
const { USER_ROLE } = require("../config/string");

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
        res.status(200).json({ statusCode: 200, success: true, message: "Otp send your email" });
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
    res.status(200).json({ statusCode: 200, success: true, message: "Otp is write" });
  } catch (e) {
    next(new ApiError(400, e.message));
  }
}

async function register(req, res, next) {
  try {
    const { email } = req.body;
    const findUser = await UserModel.findOne({ email });
    if (findUser) {
      return next(new ApiError(400, "Email is exist"));
    }
    const user = new UserModel({ ...req.body, role: USER_ROLE });
    await user.save();
    res.status(200).json({
      statusCode: 200, success: true,
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
    res
      .status(200)
      .json({ statusCode: 200, success: true, token, message: "login successfully" });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

module.exports = { verifyEmail, verifyOtp, register, login };

const AdminModel = require("../../model/admin/admin_model");
const ApiError = require("../../util/error");
const fs = require("fs");
const path = require("path");
const transporter = require("../../util/transporter");
const { comparePassword } = require("../../util/hash");
const { createToken } = require("../../util/jwt_token");
const { VERIFY_EMAIL_ROUTE } = require("../../config/config");
const { ADMIN_ROLE } = require("../../config/string");

async function register(req, res, next) {
  try {
    const { email } = req.body;
    const findAdmin = await AdminModel.findOne({ email });
    if (findAdmin) {
      return next(new ApiError(400, "Email already exist"));
    }
    const admin = new AdminModel(req.body);
    await admin.save();
    const id = admin._id;
    const filePath = path.join(__dirname, "../../../public/link.html");
    let htmlData = fs.readFileSync(filePath, "utf-8");
    htmlData = htmlData.replace(
      "${verificationLink}",
      `${VERIFY_EMAIL_ROUTE}?id=${id}`
    );
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
        res
          .status(200)
          .json({ statusCode: 200, success: true, message: "Email send successfully" });
      }
    );
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

async function verifyAdminEmail(req, res, next) {
  try {
    const id = req.query.id;
    const findAdmin = await AdminModel.findById(id);
    if (!findAdmin) {
      return next(new ApiError(400, "This email is not valid"));
    }
    findAdmin.isVerified = true;
    await findAdmin.save();
    res
      .status(200)
      .json({ statusCode: 200, success: true, message: "Email verified successfully" });
  } catch (e) {
    return next(new ApiError(400, "This email is not valid"));
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const findAdmin = await AdminModel.findOne({ email });
    if (!findAdmin) {
      return next(new ApiError(400, "Email is not exist"));
    }
    if (!findAdmin.isVerified) {
      return next(new ApiError(400, "Email is not verified"));
    }
    const match = comparePassword(password, findAdmin.password);
    if (!match) {
      return next(new ApiError(400, "Password is wrong"));
    }
    const token = createToken({
      _id: findAdmin._id,
      role: ADMIN_ROLE,
      email: findAdmin.email,
    });
    res
      .status(200)
      .json({ statusCode: 200, success: true, token, message: "login successfully", data: { username: findAdmin.username } });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

module.exports = { register, verifyAdminEmail, login };

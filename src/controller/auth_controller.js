const UserModel = require("../model/user_model");
const ApiError = require("../util/error");

async function register(req, res, next) {
  try {
    const { email } = req.body;
    const findUser = await UserModel.findOne({ email });
    if (findUser) {
      return next(new ApiError(400, "Email is exist"));
    }
    const user = new UserModel(req.body);
    await user.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Otp send successfully for register in your email",
      });
  } catch (e) {
    return next(new ApiError(400, e.message));
  }
}

module.exports = { register };

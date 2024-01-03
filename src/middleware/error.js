const ApiError = require("../util/error");

module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    res.status(200).json({ statusCode: err.statusCode, success: false, message: err.message });
  } else {
    res.status(200).json({ statusCode: 500, success: false, message: "Internal server error" });
  }
};

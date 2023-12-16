const ApiError = require("../util/error");

module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

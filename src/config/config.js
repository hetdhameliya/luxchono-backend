const { config } = require("dotenv");

config();

module.exports.PORT = process.env.PORT;
module.exports.DB_CONNECT = process.env.DB_CONNECT;
module.exports.VERIFY_EMAIL_ROUTE = process.env.VERIFY_EMAIL_ROUTE;
module.exports.MAIL_EMAIL = process.env.MAIL_EMAIL;
module.exports.MAIL_PASSWORD = process.env.MAIL_PASSWORD;
module.exports.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

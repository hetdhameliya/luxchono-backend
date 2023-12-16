const { config } = require("dotenv");

config();

module.exports.PORT = process.env.PORT;
module.exports.DB_CONNECT = process.env.DB_CONNECT;

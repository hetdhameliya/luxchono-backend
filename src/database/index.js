const mongoose = require("mongoose");
const { DB_CONNECT } = require("../config/config");

module.exports = function () {
  mongoose
    .connect(DB_CONNECT)
    .then(() => {
      console.log("database connect successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};

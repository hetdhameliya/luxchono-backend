const { Schema, model } = require("mongoose");
const { hashPassword } = require("../util/hash");
const { USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE } = require("../config/string");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: function () {
        return this.role === USER_ROLE ? true : false;
      },
    },
    image: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: [USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: function () {
        return this.role === SUPER_ADMIN_ROLE || this.role === USER_ROLE ? true : false;
      },
    },
    isAdminVerified: {
      type: Boolean,
      default: function () {
        return this.role === SUPER_ADMIN_ROLE || this.role === USER_ROLE ? true : false;
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hashPassword(this.password);
  }
  next();
});

module.exports = UserModel = model("users", userSchema);

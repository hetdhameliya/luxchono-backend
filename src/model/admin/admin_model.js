const { Schema, model } = require("mongoose");
const { hashPassword } = require("../../util/hash");

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    publicId: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hashPassword(this.password);
  }
  next();
});

module.exports = AdminModel = model("admins", adminSchema);

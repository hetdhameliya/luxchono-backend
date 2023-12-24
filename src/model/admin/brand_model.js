const { Schema, model } = require("mongoose");

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (name) {
          return name.length > 2;
        },
        message: "Brand Name must be more than 2 characters long",
      },
    },
    icon: {
      type: String,
      required: true,
    },
    iconPublicId: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BrandModel = model("brands", brandSchema);

module.exports = BrandModel;

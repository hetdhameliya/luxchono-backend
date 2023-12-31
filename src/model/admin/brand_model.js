const { Schema, model } = require("mongoose");
const { destroy } = require("../../util/cloudinary");

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

brandSchema.post("findOneAndDelete", async function (doc, next) {
  await destroy(doc.iconPublicId);
  await destroy(doc.imagePublicId);
  next();
});

const BrandModel = model("brands", brandSchema);

module.exports = BrandModel;

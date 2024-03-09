const { Schema, model } = require("mongoose");
const ProductModel = require("./product_model");
const { destroy } = require("../../util/cloudinary");

const offerSchema = new Schema({
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (startDate) {
                return startDate > new Date();
            },
            message: 'Start date must be after the current date'
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (endDate) {
                return !this.startDate || endDate > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
        validate: {
            validator: function (offer) {
                return offer > 0;
            },
            message: "Offer percentage is not less than 0 percentage",
        },
    },
    image: {
        type: String,
    },
    publicId: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String
    }
},
    { timestamps: true }
);

offerSchema.pre('save', async function (next) {
    const product = await ProductModel.findById(this.product);
    if (!product) {
        return next('Product not exist');
    }
    product.price = product.dummyPrice - (product.dummyPrice * this.percentage / 100);
    await product.save();
    next();
});

offerSchema.post("findOneAndDelete", async function (doc, next) {
    if(doc && doc.publicId) {
        await destroy(doc.publicId);
    }
    next();
});

const OfferModel = model("offers", offerSchema);

module.exports = OfferModel;
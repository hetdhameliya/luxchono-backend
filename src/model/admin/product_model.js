const { Schema, model } = require("mongoose");
const { destroy } = require("../../util/cloudinary");


const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            validate: {
                validator: function (name) {
                    return name.length > 3;
                },
                message: "Product Name must be more than 3 characters long",
            },
        },
        productModel: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: [
                {
                    url: {
                        type: String,
                    },
                    publicId: {
                        type: String,
                    }
                }
            ],
            default: [],
            required: true,
        },
        thumbnail: {
            type: String,
            default: null,
        },
        thumbnailPublicId: {
            type: String,
            default: null,
        },
        category: {
            type: [{ type: Schema.Types.ObjectId, ref: "categories" }],
            default: [],
        },
        brand: {
            type: Schema.Types.ObjectId,
            ref: "brands",
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            validate: {
                validator: function (stock) {
                    return stock > -1;
                },
                message: "Stock is not less than 0",
            },
        },
        price: {
            type: Number,
            required: true,
            validate: {
                validator: function (price) {
                    return price > -1;
                },
                message: "Price is not less than 0",
            },
        },
        dummyPrice: {
            type: Number,
            required: true,
            validate: [
                {
                    validator: function (dummyPrice) {
                        return dummyPrice > -1;
                    },
                    message: "Dummy Price is not less than 0",
                },
                {
                    validator: function (dummyPrice) {
                        return dummyPrice >= this.price;
                    },
                    message: "Dummy Price must be greater than Price",
                },
            ],
        },
        warranty: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        offer: {
            type: Number,
            default: null,
        }
    },
    { timestamps: true }
);

productSchema.post("findOneAndDelete", async function (doc, next) {
    let publicIds = [];
    publicIds.push(...doc.image.map((e) => e.publicId));
    publicIds.push(doc.thumbnailPublicId);
    const promise = publicIds.map((id) => destroy(id));
    await Promise.all(promise);
    next();
});

productSchema.pre("save", async function (next) {
    this.offer = 100 - ((100 * this.price) / this.dummyPrice);
    next();
});

const ProductModel = model("products", productSchema);

module.exports = ProductModel;

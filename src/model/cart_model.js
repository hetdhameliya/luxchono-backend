const { Schema, model } = require('mongoose');

const cartSchema = new Schema({
    pid: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    uid: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    quantity: {
        type: Number,
        default: 1
    }
},
    { timestamps: true },
);

const CartModel = model('carts', cartSchema);

module.exports = CartModel;
const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
    {
        orderId: {
            type: String,
            default: null
        },
        paymentId: {
            type: String,
            default: null
        },
        products: {
            type: [
                {
                    product: {
                        type: Schema.Types.ObjectId,
                        ref: 'products',
                        required: true
                    },
                    orderProductPrice: {
                        type: Number,
                        required: true
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        validate: {
                            validator: function (quntity) {
                                return quntity > 0;
                            },
                            message: "Quantity is greater than 0",
                        },
                    }
                }
            ]
        },
        totalAmount: {
            type: Number,
            required: true
        },
        discountAmount: {
            type: Number,
            required: true
        },
        paymentAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Cancelled', 'Completed', 'Shipped', 'Out of Delivery', 'Delivered'],
            default: 'Pending'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        alternativePhoneNo: {
            type: String,
            default: null
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        addressType: {
            type: String,
            enum: ['Office', 'Home'],
            required: true
        },
        isCancelled: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            required: true
        },
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        },
        deliveryDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const OrderModel = model("orders", orderSchema);

module.exports = OrderModel;
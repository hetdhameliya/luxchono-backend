const { Schema, model } = require("mongoose");
const { PENDING_STATUS, COMPLETED_STATUS, SHIPPED_STATUS, OUT_OF_DELEVERY_STATUS, DELIVERED_STATUS, CANCELLED_STATUS, PAID_STATUS, UNPAID_STATUS, CASH_PAYMENT_METHOD, ONLINE_PAYMENT_METHOD } = require("../config/string");

const orderSchema = new Schema(
    {
        orderId: {
            type: String,
            default: null
        },
        razorpayOrderId: {
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
            enum: [PENDING_STATUS, COMPLETED_STATUS, SHIPPED_STATUS, OUT_OF_DELEVERY_STATUS, DELIVERED_STATUS, CANCELLED_STATUS],
            default: PENDING_STATUS
        },
        paymentStatus: {
            type: String,
            enum: [UNPAID_STATUS, PAID_STATUS],
            default: UNPAID_STATUS
        },
        method: {
            type: String,
            enum: [ONLINE_PAYMENT_METHOD, CASH_PAYMENT_METHOD],
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
const mongoose = require("mongoose");
const ApiError = require("../util/error");
const ProductModel = require("../model/admin/product_model");
const AddressModel = require("../model/address_model");
const { productPipeline } = require("./product_controller");
const { instance } = require("../config/razorpay_config");
const OrderModel = require("../model/order_model");
const crypto = require('crypto');
const { RAZORPAY_KEY_ID, WEBSITE_IMAGE_URL, RAZORPAY_CALLBACK_URL, RAZORPAY_KEY_SECRET, REDIRECT_FRONTEND_URL } = require("../config/config");
const { USER_ROLE } = require("../config/string");

async function getOrderProduct(pid, quantity) {
    if (!mongoose.isValidObjectId(pid)) {
        throw new Error("Id is not valid");
    }
    const product = await ProductModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(pid),
            },
        },
        ...productPipeline
    ]).exec();

    if (product.length === 0) {
        throw new Error("Product not exist");
    }
    return {
        product: product[0],
        quantity,
        orderProductPrice: product[0].price,
        productTotalAmount: product[0].price * quantity
    }
}
async function makeOrder(req, res, next) {
    try {
        const body = req.body;
        let orderProducts = [];
        for (let i = 0; i < body.length; i++) {
            orderProducts.push(getOrderProduct(body[i].pid, body[i].quantity));
        }
        const data = await Promise.all(orderProducts);
        for (let e of data) {
            if (e.product.stock < e.quantity) {
                return next(new ApiError(400, `${e.product.name} product is out of stock`))
            }
        }
        let totalAmount = 0;
        let paymentAmount = 0;
        for (let i = 0; i < data.length; i++) {
            paymentAmount += data[i].productTotalAmount;
            totalAmount += (data[i].product.dummyPrice * data[i].quantity);
        }
        let discountAmount = totalAmount - paymentAmount;
        let deliveryDate = Date.now() + (86400 * 1000 * 5);
        res.status(200).json({
            statusCode: 200, success: true, data: {
                orderProducts: data,
                totalAmount,
                discountAmount,
                paymentAmount,
                deliveryDate: new Date(deliveryDate),
            }
        });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function paymentOrder(req, res, next) {
    try {
        const { products, address } = req.body;
        if (products.length === 0) {
            return next(new ApiError(400, "Product is not empty"));
        }
        if (!address) {
            return next(new ApiError(400, "Please enter address"));
        }
        const userAddress = await AddressModel.findOne({ uid: req.id, _id: address });
        if (!userAddress) {
            return next(new ApiError(400, "Enter valid address"));
        }
        const orderProducts = [];
        for (let i = 0; i < products.length; i++) {
            orderProducts.push(getOrderProduct(products[i].product, products[i].quantity));
        }
        const data = await Promise.all(orderProducts);
        for (let e of data) {
            if (e.product.stock < e.quantity) {
                return next(new ApiError(400, `${e.product.name} is out of stock`))
            }
        }
        let orderProduct = data.map((e) => ({ product: e.product._id, orderProductPrice: e.orderProductPrice, quantity: e.quantity }));
        let totalAmount = 0;
        let paymentAmount = 0;
        for (let i = 0; i < data.length; i++) {
            paymentAmount += data[i].productTotalAmount;
            totalAmount += (data[i].product.dummyPrice * data[i].quantity);
        }
        let discountAmount = totalAmount - paymentAmount;

        let deliveryDate = Date.now() + (86400 * 1000 * 5);

        const orderModel = new OrderModel({
            products: orderProduct,
            totalAmount,
            discountAmount,
            paymentAmount,
            user: req.id,
            fullName: userAddress.fullName,
            phoneNo: userAddress.phoneNo,
            alternativePhoneNo: userAddress.alternativePhoneNo,
            state: userAddress.state,
            city: userAddress.city,
            address: userAddress.address,
            pincode: userAddress.pincode,
            addressType: userAddress.addressType,
            date: Date.now(),
            deliveryDate: new Date(deliveryDate),
        });
        const order = await instance.orders.create({
            amount: paymentAmount * 100,
            currency: "INR",
        });
        await orderModel.save();
        orderModel.orderId = order.id;
        await orderModel.save();

        setTimeout(async () => {
            const orderDelete = await OrderModel.findOneAndDelete({ _id: orderModel._id, status: { $eq: "Pending" } });
        }, 1000 * 60);

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: {
                key: RAZORPAY_KEY_ID,
                amount: paymentAmount * 100,
                currency: "INR",
                name: "Luxchono",
                description: "Watch not just a time",
                order_id: order.id,
                image: WEBSITE_IMAGE_URL,
                callback_url: RAZORPAY_CALLBACK_URL,
                prefill: {
                    name: req.user.username,
                    email: req.user.email,
                    contact: req.user.phoneNo
                },
                notes: {
                    address: userAddress.address
                },
                theme: {
                    color: "#964315"
                }
            }
        });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function paymentVerification(req, res, next) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const generatedSignature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (generatedSignature === razorpay_signature) {
            const order = await OrderModel.findOne({ orderId: razorpay_order_id });
            if (!order) {
                return res.redirect(`${REDIRECT_FRONTEND_URL}`);
            }
            order.paymentId = razorpay_payment_id;
            order.status = "Completed";
            await order.save();
            const orderProducts = order.products;
            for (let e of orderProducts) {
                await ProductModel.findByIdAndUpdate(e.product, { $inc: { stock: -e.quantity } });
            }
            return res.redirect(`${REDIRECT_FRONTEND_URL}?orderId=${order._id}`);
        }
        return next(new ApiError(400, "Payment failed"));
    } catch (e) {
        return next(new ApiError(400, "Payment verification failed"));
    }
}

async function getOrder(req, res, next) {
    try {
        const { orderId } = req.query;
        const id = req.id;
        if (!orderId) {
            return next(new ApiError(400, "Order id is required"));
        }
        const order = await OrderModel.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(id),
                    _id: new mongoose.Types.ObjectId(orderId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: "user",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                email: 1,
                                phoneNo: 1,
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$user"
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product',
                    foreignField: '_id',
                    as: "product",
                    pipeline: [
                        ...productPipeline
                    ]
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: 1,
                    orderId: 1,
                    paymentId: 1,
                    product: "$product",
                    orderProductPrice: "$products.orderProductPrice",
                    quantity: "$products.quantity",
                    totalAmount: 1,
                    discountAmount: 1,
                    paymentAmount: 1,
                    status: 1,
                    user: 1,
                    fullName: 1,
                    phoneNo: 1,
                    alternativePhoneNo: 1,
                    state: 1,
                    city: 1,
                    address: 1,
                    pincode: 1,
                    addressType: 1,
                    isCancelled: 1,
                    date: 1,
                    latitude: 1,
                    longitude: 1,
                    deliveryDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    __v: 1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    orderId: { $first: "$orderId" },
                    paymentId: { $first: "$paymentId" },
                    products: {
                        $push: {
                            product: "$product",
                            orderProductPrice: "$orderProductPrice",
                            quantity: "$quantity"
                        }
                    },
                    totalAmount: { $first: "$totalAmount" },
                    discountAmount: { $first: "$discountAmount" },
                    paymentAmount: { $first: "$paymentAmount" },
                    status: { $first: "$status" },
                    user: { $first: "$user" },
                    fullName: { $first: "$fullName" },
                    phoneNo: { $first: "$phoneNo" },
                    alternativePhoneNo: { $first: "$alternativePhoneNo" },
                    state: { $first: "$state" },
                    city: { $first: "$city" },
                    address: { $first: "$address" },
                    pincode: { $first: "$pincode" },
                    addressType: { $first: "$addressType" },
                    isCancelled: { $first: "$isCancelled" },
                    date: { $first: "$date" },
                    latitude: { $first: "$latitude" },
                    longitude: { $first: "$longitude" },
                    deliveryDate: { $first: "$deliveryDate" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    __v: { $first: "$__v" }
                }
            }
        ]).exec();
        if (order.length === 0) {
            return next(new ApiError(400, "Order is not found"));
        }
        res.status(200).json({ statusCode: 200, success: true, data: order[0] });
    } catch (e) {
        return next(new ApiError(400, "Payment verification failed"));
    }
}

async function getAllOrder(req, res, next) {
    try {
        const filter = {};
        if (req.role === USER_ROLE) {
            filter.user = req.user._id;
        }
        const orders = await OrderModel.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: "user",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                email: 1,
                                phoneNo: 1,
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$user"
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product',
                    foreignField: '_id',
                    as: "product",
                    pipeline: [
                        ...productPipeline
                    ]
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: 1,
                    orderId: 1,
                    paymentId: 1,
                    product: "$product",
                    orderProductPrice: "$products.orderProductPrice",
                    quantity: "$products.quantity",
                    totalAmount: 1,
                    discountAmount: 1,
                    paymentAmount: 1,
                    status: 1,
                    user: 1,
                    fullName: 1,
                    phoneNo: 1,
                    alternativePhoneNo: 1,
                    state: 1,
                    city: 1,
                    address: 1,
                    pincode: 1,
                    addressType: 1,
                    isCancelled: 1,
                    date: 1,
                    latitude: 1,
                    longitude: 1,
                    deliveryDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    __v: 1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    orderId: { $first: "$orderId" },
                    paymentId: { $first: "$paymentId" },
                    products: {
                        $push: {
                            product: "$product",
                            orderProductPrice: "$orderProductPrice",
                            quantity: "$quantity"
                        }
                    },
                    totalAmount: { $first: "$totalAmount" },
                    discountAmount: { $first: "$discountAmount" },
                    paymentAmount: { $first: "$paymentAmount" },
                    status: { $first: "$status" },
                    user: { $first: "$user" },
                    fullName: { $first: "$fullName" },
                    phoneNo: { $first: "$phoneNo" },
                    alternativePhoneNo: { $first: "$alternativePhoneNo" },
                    state: { $first: "$state" },
                    city: { $first: "$city" },
                    address: { $first: "$address" },
                    pincode: { $first: "$pincode" },
                    addressType: { $first: "$addressType" },
                    isCancelled: { $first: "$isCancelled" },
                    date: { $first: "$date" },
                    latitude: { $first: "$latitude" },
                    longitude: { $first: "$longitude" },
                    deliveryDate: { $first: "$deliveryDate" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    __v: { $first: "$__v" }
                }
            },
            { $sort: { createdAt: -1 } } 
        ]).exec();
        res.status(200).json({ statusCode: 200, success: true, data: orders });
    } catch (e) {
        return next(new ApiError(400, "Internal server error"));
    }
}

module.exports = { makeOrder, paymentOrder, paymentVerification, getOrder, getAllOrder };
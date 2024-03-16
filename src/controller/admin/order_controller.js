const OrderModel = require("../../model/order_model");
const { productPipeline } = require("../product_controller");
const ApiError = require("../../util/error");
const transporter = require("../../util/transporter");
const { PENDING_STATUS, COMPLETED_STATUS, SHIPPED_STATUS, OUT_OF_DELEVERY_STATUS, DELIVERED_STATUS, CANCELLED_STATUS } = require("../../config/string");
const { REDIRECT_FRONTEND_URL } = require("../../config/config");

async function getAllOrder(_req, res, next) {
    try {
        const orders = await OrderModel.aggregate([
            {
                $match: { status: { $ne: PENDING_STATUS } }
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
                    razorpayOrderId: 1,
                    paymentId: 1,
                    product: "$product",
                    orderProductPrice: "$products.orderProductPrice",
                    quantity: "$products.quantity",
                    totalAmount: 1,
                    discountAmount: 1,
                    paymentAmount: 1,
                    status: 1,
                    paymentStatus: 1,
                    method: 1,
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
                    cancelDate: 1,
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
                    razorpayOrderId: { $first: "$razorpayOrderId" },
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
                    paymentStatus: { $first: "$paymentStatus" },
                    method: { $first: "$method" },
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
                    cancelDate: { $first: "$cancelDate" },
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

async function orderStatusChange(req, res, next) {
    try {
        const { status, orderId } = req.body;
        const allStatus = [PENDING_STATUS, COMPLETED_STATUS, SHIPPED_STATUS, OUT_OF_DELEVERY_STATUS, DELIVERED_STATUS, CANCELLED_STATUS];
        if (!allStatus.includes(status)) {
            return next(new ApiError(400, "This status are in valid"));
        }
        if (status == PENDING_STATUS || status == COMPLETED_STATUS) {
            return next(new ApiError(400, "This status are in valid"));
        }
        if (!orderId) {
            return next(new ApiError(400, "Order id is required"));
        }
        const findOrder = await OrderModel.findById(orderId).populate("user");
        if (!findOrder) {
            return next(new ApiError(400, "Order is not found"));
        }
        if (findOrder.status === DELIVERED_STATUS || findOrder.status === CANCELLED_STATUS) {
            return next(new ApiError(400, `After ${DELIVERED_STATUS} and ${CANCELLED_STATUS} status you can not update status`));
        }
        if(findOrder.status == status) {
            return next(new ApiError(400, 'Updated status is same for order status'));
        }
        if(status !== CANCELLED_STATUS) {
            await transporter.sendMail({
                to: findOrder.user.email,
                subject: "Order Regarding",
                text: `Your this order id ${findOrder.orderId} status change ${findOrder.status} to ${status}\nCheck to order status click on this link\n${REDIRECT_FRONTEND_URL}?orderId=${findOrder.razorpayOrderId}`
            });
        }
        if(status === CANCELLED_STATUS) {
            await transporter.sendMail({
                to: findOrder.user.email,
                subject: "Order Regarding",
                text: `Your this order id ${findOrder.orderId} order cancel. give refund with in 2 days.\nCheck to order status click on this link\n${REDIRECT_FRONTEND_URL}?orderId=${findOrder.razorpayOrderId}`
            });
            findOrder.isCancelled = true;
            findOrder.cancelDate = Date.now();
        }
        findOrder.status = status;
        await findOrder.save({ validateBeforeSave: true });
        res.status(200).json({ statusCode: 200, success: true, message: "Order status update successfully" });
    } catch (e) {
        return next(new ApiError(400, "Internal server error"));
    }
}

module.exports = { getAllOrder, orderStatusChange };
const OrderModel = require("../../model/order_model");
const NotificationModel = require("../../model/notification_model");
const ApiError = require("../../util/error");
const transporter = require("../../util/transporter");
const { PENDING_STATUS, COMPLETED_STATUS, SHIPPED_STATUS, OUT_OF_DELEVERY_STATUS, DELIVERED_STATUS, CANCELLED_STATUS, CASH_PAYMENT_METHOD, PAID_STATUS, PRIVATE_NOTIFICATION } = require("../../config/string");
const { REDIRECT_FRONTEND_URL } = require("../../config/config");
const { orderPipeline } = require("../order_controller");

async function getAllOrder(_req, res, next) {
    try {
        const orders = await OrderModel.aggregate([
            {
                $match: { status: { $ne: PENDING_STATUS } }
            },
            ...orderPipeline,
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
        if (findOrder.status == status) {
            return next(new ApiError(400, 'Updated status is same for order status'));
        }
        if (status !== CANCELLED_STATUS) {
            await transporter.sendMail({
                to: findOrder.user.email,
                subject: "Order Regarding",
                text: `Your this order id ${findOrder.orderId} status change ${findOrder.status} to ${status}\nCheck to order status click on this link\n${REDIRECT_FRONTEND_URL}?orderId=${findOrder.razorpayOrderId}`
            });
        }
        if (status === CANCELLED_STATUS) {
            await transporter.sendMail({
                to: findOrder.user.email,
                subject: "Order Regarding",
                text: `Your this order id ${findOrder.orderId} order cancel. give refund with in 2 days.\nCheck to order status click on this link\n${REDIRECT_FRONTEND_URL}?orderId=${findOrder.razorpayOrderId}`
            });
            findOrder.isCancelled = true;
            findOrder.cancelDate = Date.now();
        } else if (status === DELIVERED_STATUS && findOrder.method === CASH_PAYMENT_METHOD) {
            findOrder.paymentStatus = PAID_STATUS;
        }
        findOrder.status = status;
        await findOrder.save({ validateBeforeSave: true });
        const notification = new NotificationModel({
            title: `Order Update: ${findOrder.status}`,
            description: `Your order ${findOrder.orderId} has been ${findOrder.status}`,
            type: PRIVATE_NOTIFICATION,
            user: findOrder.user._id,
            extra: {
                order: findOrder._id
            }
        });
        await notification.save({ validateBeforeSave: true });
        res.status(200).json({ statusCode: 200, success: true, message: "Order status update successfully" });
    } catch (e) {
        return next(new ApiError(400, "Internal server error"));
    }
}

module.exports = { getAllOrder, orderStatusChange };
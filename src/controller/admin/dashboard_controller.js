const ProductModel = require("../../model/admin/product_model");
const OrderModel = require("../../model/order_model");
const BrandModel = require("../../model/admin/brand_model");
const RatingModel = require("../../model/rating_model");
const UserModel = require("../../model/user_model");
const ApiError = require("../../util/error");
const { PENDING_STATUS, PAID_STATUS } = require("../../config/string");

async function dashboard(_req, res, next) {
    try {
        const totalProduct = await ProductModel.countDocuments();
        const totalOrder = await OrderModel.countDocuments({ status: { $ne: PENDING_STATUS } });
        const totalBrand = await BrandModel.countDocuments();
        const totalUser = await UserModel.countDocuments({ isVerified: true });
        const totalAmountData = await OrderModel.aggregate([
            {
                $match: {
                    "paymentStatus": { $eq: PAID_STATUS }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPaymentAmount: { $sum: "$paymentAmount" }
                }
            }
        ]).exec();

        let totalRevenue = 0;
        if (totalAmountData.length > 0) {
            totalRevenue = totalAmountData[0].totalPaymentAmount;
        }

        res.status(200).json({
            statusCode: 200,
            success: true,
            data: {
                totalProduct,
                totalOrder,
                totalBrand,
                totalUser,
                totalRevenue,
            }
        });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function brandRevenue(_req, res, next) {
    try {
        const data = await OrderModel.aggregate([
            {
                $match: {
                    "status": { $ne: PENDING_STATUS },
                    "paymentStatus": { $eq: PAID_STATUS }
                }
            },
            {
                $unwind: { path: "$products", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "products.product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
            },
            {
                $group: {
                    _id: "$product.brand",
                    totalBrandRevenue: { $sum: { $multiply: ["$products.orderProductPrice", "$products.quantity"] } }
                }
            },
            {
                $lookup: {
                    from: "brands",
                    localField: "_id",
                    foreignField: "_id",
                    as: "brand"
                }
            },
            {
                $unwind: {
                    path: "$brand",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    _id: 1,
                    totalBrandRevenue: 1,
                    "brand.name": 1,
                    "brand._id": 1
                }
            }
        ]).exec();
        res.status(200).json({
            statusCode: 200,
            success: true,
            data
        });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function getProductReview(_req, res, next) {
    try {
        const ratings = await RatingModel.find({}).populate([
            {
                path: "user",
                select: {
                    email: 1,
                    username: 1,
                    phoneNo: 1,
                }
            },
            {
                path: "product",
                select: {
                    name: 1,
                    productModel: 1
                }
            }
        ]);
        res.status(200).json({
            statusCode: 200,
            success: true,
            data: ratings
        });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function orderCount(_req, res, next) {
    try {
        const data = await OrderModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    "status": "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]).exec();
        res.status(200).json({
            statusCode: 200,
            success: true,
            data
        });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

module.exports = { dashboard, brandRevenue, getProductReview, orderCount };
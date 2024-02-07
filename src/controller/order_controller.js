const mongoose = require("mongoose");
const ApiError = require("../util/error");
const ProductModel = require("../model/admin/product_model");

async function getOrderProduct(pid, quantity) {
    const product = await ProductModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(pid),
            },
        },
        {
            $addFields: {
                image: {
                    $map: {
                        input: "$image",
                        as: "image",
                        in: "$$image.url"
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            }
        },
        {
            $addFields: {
                brand: {
                    $arrayElemAt: ['$brand', 0]
                }
            }
        }
    ]).exec();
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
        let totalAmount = 0;
        let paymentAmount = 0;
        for (let i = 0; i < data.length; i++) {
            paymentAmount += data[i].productTotalAmount;
            totalAmount += (data[i].product.dummyPrice * data[i].quantity);
        }
        let discountAmount = totalAmount - paymentAmount;
        res.status(200).json({
            statusCode: 200, success: true, data: {
                orderProducts: data,
                totalAmount,
                discountAmount,
                paymentAmount,
            }
        })
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

module.exports = { makeOrder };
const mongoose = require("mongoose");
const CartModel = require("../model/cart_model");
const ApiError = require("../util/error");

async function addRemoveCart(req, res, next) {
    try {
        const id = req.id;
        const { pid } = req.body;
        const findCartProduct = await CartModel.findOne({ pid, uid: id });
        if (findCartProduct) {
            await CartModel.deleteOne({ pid, uid: id });
            return res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Remove product from the cart"
            });
        } else {
            const cartProduct = new CartModel({ pid, uid: id });
            await cartProduct.save();
            return res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Add product in the cart"
            });
        }
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function getAllCartProduct(req, res, next) {
    try {
        const id = req.id;
        const cartProducts = await CartModel.aggregate([
            {
                $match: {
                    uid: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "products",
                    foreignField: "_id",
                    localField: "pid",
                    as: "product",
                    pipeline: [
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
                        },
                    ]
                }
            },
            {
                $project: {
                    _id: "$_id",
                    product: {
                        $first: "$product"
                    },
                    quantity: "$quantity",
                    createdAt: '$createdAt',
                    updatedAt: "$updatedAt"
                }
            }
        ]).exec();
        return res.status(200).json({ statusCode: 200, success: true, data: cartProducts });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function updateCartProduct(req, res, next) {
    try {
        const pid = req.params.pid;
        const uid = req.id;
        const { quantity } = req.body;
        await CartModel.findOneAndUpdate({ uid, pid }, { quantity });
        return res.status(200).json({ statusCode: 200, success: true, message: "Cart update successfully" });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

module.exports = { addRemoveCart, getAllCartProduct, updateCartProduct };
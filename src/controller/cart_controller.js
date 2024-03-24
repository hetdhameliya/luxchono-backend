const mongoose = require("mongoose");
const CartModel = require("../model/cart_model");
const ApiError = require("../util/error");
const { productPipeline } = require("./product_controller");

async function addCart(req, res, next) {
    try {
        const id = req.id;
        const { pid } = req.body;
        const findCartProduct = await CartModel.findOne({ pid, uid: id });
        if (findCartProduct) {
            findCartProduct.quantity = findCartProduct.quantity + 1;
            await findCartProduct.save();
            let length = await CartModel.countDocuments({ uid: id });
            return res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Item added to cart",
                data: {
                    length
                }
            });
        }
        const cartProduct = new CartModel({ pid, uid: id });
        await cartProduct.save();
        let length = await CartModel.countDocuments({ uid: id });
        return res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Item added to cart",
            data: {
                length
            }
        });
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
                        ...productPipeline
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
            },
            {
                $addFields: {
                    productTotalAmount: {
                        $multiply: ["$quantity", "$product.dummyPrice"]
                    },
                    productDiscountAmount: {
                        $subtract: [{ $multiply: ["$quantity", "$product.dummyPrice"] }, { $multiply: ["$quantity", "$product.price"] }]
                    },
                    productPaymentAmount: {
                        $multiply: ["$quantity", "$product.price"]
                    },
                }
            }
        ]).exec();
        let cartTotalAmount = 0;
        let cartPaymentAmount = 0;
        for (let i = 0; i < cartProducts.length; i++) {
            cartPaymentAmount += cartProducts[i].productPaymentAmount;
            cartTotalAmount += (cartProducts[i].product.dummyPrice * cartProducts[i].quantity);
        }
        let cartDiscountAmount = cartTotalAmount - cartPaymentAmount;
        return res.status(200).json({ statusCode: 200, success: true, data: { cartProducts, cartTotalAmount, cartDiscountAmount, cartPaymentAmount } });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function updateCartProduct(req, res, next) {
    try {
        const pid = req.params.pid;
        const uid = req.id;
        const { quantity } = req.body;
        let updatedCart = await CartModel.findOneAndUpdate({ uid, pid }, { quantity });
        if (updatedCart) {
            let length = await CartModel.countDocuments({ uid });
            return res.status(200).json({
                statusCode: 200, success: true, message: "Cart update successfully", data: {
                    length
                }
            });
        } else {
            return next(new ApiError(400, 'Cart is not found'));
        }
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function removeCart(req, res, next) {
    try {
        const pid = req.params.pid;
        const uid = req.id;
        const removeCart = await CartModel.findOneAndDelete({ uid, pid });
        if (removeCart) {
            let length = await CartModel.countDocuments({ uid });
            return res.status(200).json({ statusCode: 200, success: true, message: "Cart delete successfully", data: { length } });
        } else {
            return next(new ApiError(400, 'Cart is not found'));
        }
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function getAllCartIds(req, res, next) {
    try {
        const id = req.id;
        const cartModels = await CartModel.find({ uid: id }).select({ pid: true });
        const ids = cartModels.map((e) => e.pid);
        return res.status(200).json({ statusCode: 200, success: true, data: ids });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

module.exports = { addCart, getAllCartProduct, updateCartProduct, removeCart, getAllCartIds };
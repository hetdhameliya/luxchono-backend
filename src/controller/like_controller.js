const LikeModel = require("../model/like_model");
const ProductModel = require("../model/admin/product_model");
const ApiError = require("../util/error");

async function addRemoveLike(req, res, next) {
    try {
        const id = req.id;
        const { pid } = req.body;
        const findLikeProduct = await LikeModel.findOne({ pid, uid: id });
        if (findLikeProduct) {
            await LikeModel.deleteOne({ pid, uid: id });
            return res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Remove product from the wishlist"
            });
        } else {
            const likeProduct = new LikeModel({ pid, uid: id });
            await likeProduct.save();
            return res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Add product in the wishlist"
            });
        }
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function getAllLikeProduct(req, res, next) {
    try {
        const id = req.id;
        const likeModels = await LikeModel.find({ uid: id }).select({ pid: true });
        const ids = likeModels.map((e) => e.pid);
        const likeProducts = await ProductModel.aggregate([
            {
                $match: {
                    _id: {
                        $in: ids
                    }
                }
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
        return res.status(200).json({ statusCode: 200, success: true, data: likeProducts });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function getAllLikeIds(req, res, next) {
    try {
        const id = req.id;
        const likeModels = await LikeModel.find({ uid: id }).select({ pid: true });
        const ids = likeModels.map((e) => e.pid);
        return res.status(200).json({ statusCode: 200, success: true, data: ids });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

module.exports = { addRemoveLike, getAllLikeProduct, getAllLikeIds };
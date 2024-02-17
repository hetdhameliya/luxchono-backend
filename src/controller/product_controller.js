const ProductModel = require("../model/admin/product_model");
const ApiError = require("../util/error");
const mongoose = require("mongoose");

const productPipeline = [
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
];

async function getProducts(req, res, next) {
    try {
        let pipeline = [];
        const { category, brand, search, startPrice, endPrice, size } = req.query;

        const filters = {};

        if (category && Array.isArray(category)) {
            let categoryIds = [];
            for (let i = 0; i < category.length; i++) {
                categoryIds.push(new mongoose.Types.ObjectId(category[i]));
            }
            filters.category = { $in: categoryIds };
        }

        if (brand && Array.isArray(brand)) {
            let brandIds = [];
            for (let i = 0; i < brand.length; i++) {
                brandIds.push(new mongoose.Types.ObjectId(brand[i]));
            }
            filters.brand = { $in: brandIds };
        }

        if (startPrice && !isNaN(startPrice)) {
            filters.price = { $gte: parseFloat(startPrice) };
        }

        if (endPrice && !isNaN(endPrice)) {
            filters.price = filters.price || {};
            filters.price.$lte = parseFloat(endPrice);
        }

        if (search) {
            filters.$or = [
                { name: { $regex: new RegExp(search, 'i') } },
                { productModel: { $regex: new RegExp(search, 'i') } },
            ];
        }
        pipeline.push(...productPipeline);
        if (size) {
            pipeline.push(
                {
                    $sample: { size: parseInt(size) }
                }
            );
        }
        if (filters) {
            pipeline.unshift(
                {
                    $match: filters
                }
            )
        }
        const products = await ProductModel.aggregate(pipeline).exec();
        res.status(200).json({ statusCode: 200, success: true, data: products });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function getOneProduct(req, res, next) {
    try {
        const id = req.params.id;
        const isValid = mongoose.isValidObjectId(id);
        if (!isValid) {
            return next(new ApiError(400, "Id is not valid"));
        }
        const products = await ProductModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            ...productPipeline
        ]).exec();
        if (products.length === 0) {
            return next(new ApiError(400, "Product is not exist"));
        }
        const similarProduct = await ProductModel.aggregate([
            {
                $match: {
                    $and: [
                        { _id: { $ne: products[0]._id } },
                        {
                            $or: [
                                { category: { $in: products[0].category.map((e) => e._id) } },
                                { brand: { $eq: products[0].brand._id } }
                            ]
                        }
                    ]
                }
            },
            ...productPipeline,
            {
                $limit: 8
            }
        ]).exec()
        res.status(200).json({ statusCode: 200, success: true, data: { product: products[0], similarProduct }, message: "Get one product successfully" });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

module.exports = { getProducts, productPipeline, getOneProduct };
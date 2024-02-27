const ApiError = require("../../util/error");
const { upload, multipleImageUpload, destroy } = require("../../util/cloudinary");
const ProductModel = require("../../model/admin/product_model");
const mongoose = require('mongoose');
const { productPipeline } = require("../product_controller");

const addProduct = async (req, res, next) => {
    try {
        if (!req.files.thumbnail || req.files.thumbnail.length === 0) {
            return next(new ApiError(400, "Thumbnail is required"));
        }
        if (!req.files.image || req.files.image.length === 0) {
            return next(new ApiError(400, "Image is required"));
        }
        const product = new ProductModel(req.body);
        await product.save();

        const resultImage = await multipleImageUpload(req.files.image.map(e => e.path));
        const resultThumbnail = await upload(req.files.thumbnail[0].path);

        product.thumbnailPublicId = resultThumbnail.public_id;
        product.thumbnail = resultThumbnail.secure_url;
        product.image = resultImage.map((e) => {
            return { url: e.secure_url, publicId: e.public_id }
        });
        await product.save({ validateBeforeSave: true });
        const productById = await ProductModel.aggregate([
            {
                $match: { _id: product._id }
            },
            ...productPipeline
        ]).exec();
        res.status(200).json({ statusCode: 200, success: true, message: "Product add successfully", data: productById[0] });
    } catch (e) {
        return next(new ApiError(400, "Please enter valid product details"));
    }
};

const getProduct = async (req, res, next) => {
    try {
        const products = await ProductModel.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { name: { $regex: req.query.search, $options: 'i' } },
                        { productModel: { $regex: req.query.search, $options: 'i' } }
                    ]
                }
            },
            ...productPipeline
        ]);
        res.status(200).json({ statusCode: 200, success: true, data: products });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        let { name, description, productModel, category, brand, stock, price, dummyPrice, warranty, isActive } = req.body;
        if (!id) {
            return next(new ApiError(400, "Id is required"));
        }
        if (!mongoose.isValidObjectId(id)) {
            return next(new ApiError(400, "Id is not valid"));
        }
        const findProduct = await ProductModel.findById(id);
        if (!findProduct) {
            return next(new ApiError(400, "Product not in the database"));
        }
        const images = req.body.image;
        const includeImages = findProduct.image.filter((e) => images?.includes(e.url));
        const notIncludeImages = findProduct.image.filter((e) => !images?.includes(e.url));
        const promise = notIncludeImages.map((e) => destroy(e.publicId));
        await Promise.all(promise);
        findProduct.image = includeImages;
        if (req.files.image && req.files.image.length !== 0) {
            const resultImage = await multipleImageUpload(req.files.image.map(e => e.path));
            const uploadImages = resultImage.map((e) => {
                return {
                    url: e.secure_url,
                    publicId: e.public_id
                }
            });
            includeImages.push(...uploadImages);
            findProduct.image = includeImages;
        }
        if (req.files.thumbnail && req.files.thumbnail.length !== 0) {
            await destroy(findProduct.thumbnailPublicId);
            const resultThumbnail = await upload(req.files.thumbnail[0].path);
            findProduct.thumbnail = resultThumbnail.secure_url;
            findProduct.thumbnailPublicId = resultThumbnail.public_id;
        }
        findProduct.name = name || findProduct.name;
        findProduct.description = description || findProduct.description;
        findProduct.productModel = productModel || findProduct.productModel;
        findProduct.category = category || findProduct.category;
        findProduct.brand = brand || findProduct.brand;
        findProduct.stock = stock || findProduct.stock;
        findProduct.price = price || findProduct.price;
        findProduct.dummyPrice = dummyPrice || findProduct.dummyPrice;
        findProduct.warranty = warranty || findProduct.warranty;
        findProduct.isActive = isActive || findProduct.isActive;
        await findProduct.save();
        const productById = await ProductModel.aggregate([
            {
                $match: { _id: findProduct._id }
            },
            ...productPipeline
        ]).exec();
        res.status(200).json({ statusCode: 200, success: true, message: "Product updated successfully", data: productById[0] });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        let idsToDelete;
        if (req.query.id && Array.isArray(req.query.id)) {
            idsToDelete = req.query.id;
            const isValid = idsToDelete.every(id => mongoose.isValidObjectId(id));
            if (!isValid) {
                return next(new ApiError(400, 'Invalid ID format'));
            }
        } else {
            return next(new ApiError(400, 'Invalid ID format'));
        }
        let promises = [];
        for (let i = 0; i < idsToDelete.length; i++) {
            promises.push(ProductModel.findOneAndDelete({ _id: idsToDelete[i] }));
        }
        await Promise.all(promises);
        res.status(200).json({ statusCode: 200, success: true, message: "Product deleted successfully" });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
};

module.exports = { addProduct, deleteProduct, getProduct, updateProduct };
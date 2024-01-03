const ApiError = require("../../util/error");
const { upload, multipleImageUpload, destroy } = require("../../util/cloudinary");
const ProductModel = require("../../model/admin/product_model");
const { isValidObjectId } = require('mongoose');

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
        product.image = resultImage.map((e) => e.secure_url);
        product.imagePublicId = resultImage.map((e) => e.public_id);

        await product.save({ validateBeforeSave: true });
        const productById = await ProductModel.findById(product._id)
            .populate([
                {
                    path: "category",
                    select: {
                        "imagePublicId": false,
                        "iconPublicId": false,
                    }
                },
                {
                    path: "brand",
                    select: {
                        "imagePublicId": false,
                        "iconPublicId": false,
                    }
                },
            ])
            .select(
                {
                    "imagePublicId": false,
                    "thumbnailPublicId": false
                }
            )
            .exec();
        res.status(200).json({ statusCode: 200, success: true, message: "Product add successfully", data: productById });
    } catch (e) {
        return next(new ApiError(400, "Please enter valid product details"));
    }
};

const getProduct = async (req, res, next) => {
    try {
        const products = await ProductModel.find({})
            .populate([
                {
                    path: "category",
                    select: {
                        "imagePublicId": false,
                        "iconPublicId": false,
                    }
                },
                {
                    path: "brand",
                    select: {
                        "imagePublicId": false,
                        "iconPublicId": false,
                    }
                },
            ])
            .select(
                {
                    "imagePublicId": false,
                    "thumbnailPublicId": false
                }
            )
            .exec();
        res.status(200).json({ statusCode: 200, success: true, data: products });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        let { name, description, productModel, category, brand, stock, price, dummyPrice, warranty } = req.body;
        if (!id) {
            return next(new ApiError(400, "Id is required"));
        }
        if (!isValidObjectId(id)) {
            return next(new ApiError(400, "Id is not valid"));
        }
        const findProduct = await ProductModel.findById(id);
        if (!findProduct) {
            return next(new ApiError(400, "Product not in the database"));
        }
        if (req.files.image || req.files.image.length !== 0) {
            const promise = findProduct.imagePublicId.map((id) => destroy(id));
            await Promise.all(promise);
            const resultImage = await multipleImageUpload(req.files.image.map(e => e.path));
            findProduct.image = resultImage.map((e) => e.secure_url);
            findProduct.imagePublicId = resultImage.map((e) => e.public_id);
        }
        if (req.files.thumbnail || req.files.thumbnail.length !== 0) {
            await destroy(findProduct.thumbnailPublicId);
            const resultThumbnail = await upload(req.files.thumbnail[0].path);
            findProduct.thumbnail = resultThumbnail.secure_url;
            findProduct.thumbnailPublicId = resultThumbnail.public_id;
        }
        findProduct.name = name;
        findProduct.description = description;
        findProduct.productModel = productModel;
        findProduct.category = category;
        findProduct.brand = brand;
        findProduct.stock = stock;
        findProduct.price = price;
        findProduct.dummyPrice = dummyPrice;
        findProduct.warranty = warranty;
        await findProduct.save();
        const productById = await ProductModel.findById(findProduct._id)
            .populate([
                {
                    path: "category",
                    select: {
                        "imagePublicId": false,
                        "iconPublicId": false,
                    }
                },
                {
                    path: "brand",
                    select: {
                        "imagePublicId": false,
                        "iconPublicId": false,
                    }
                },
            ])
            .select(
                {
                    "imagePublicId": false,
                    "thumbnailPublicId": false
                }
            )
            .exec();
        res.status(200).json({ statusCode: 200, success: true, message: "Product updated successfully", data: productById });
    } catch (e) {
        console.log(e);
        return next(new ApiError(400, e.message));
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        let idsToDelete;
        if (req.query.id && Array.isArray(req.query.id)) {
            idsToDelete = req.query.id;
            const isValid = idsToDelete.every(id => isValidObjectId(id));
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
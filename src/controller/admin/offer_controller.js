const ApiError = require("../../util/error");
const { upload, destroy } = require("../../util/cloudinary");
const { isValidObjectId } = require('mongoose');
const OfferModel = require("../../model/admin/offer_model");
const { productPipeline } = require("../product_controller");

async function addOffer(req, res, next) {
    try {
        const { startDate, endDate, percentage, product, name } = req.body;
        const { file } = req;
        if (!startDate || !endDate || !percentage || !product || !name) {
            return next(new ApiError(400, 'Enter valid details'));
        }
        if (!file) {
            return next(new ApiError(400, 'Image is required'));
        }
        const findOffer = await OfferModel.findOne({ product: product });
        if (findOffer) {
            req.params.id = findOffer._id;
            updateOffer(req, res, next);
            return;
        }
        const offer = new OfferModel(req.body);
        await offer.save();
        const result = await upload(req.file.path);
        offer.image = result.secure_url;
        offer.publicId = result.public_id;
        await offer.save();
        res.status(200).json({
            statusCode: 200,
            success: true,
            message: 'Offer add successfully',
        });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function getAllOffer(req, res, next) {
    const { search } = req.query;
    let filters = {};
    if(search) {
        filters.$or = [
            { 'product.name': { $regex: new RegExp(search, 'i') } },
            { 'product.productModel': { $regex: new RegExp(search, 'i') } },
        ];
    }

    try {
        const offers = await OfferModel.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: "product",
                    pipeline: [
                        ...productPipeline
                    ]
                }
            },
            {
                $addFields: {
                    product: {
                        $first: "$product"
                    }
                }
            },
            {
                $match: filters
            }
        ]);
        res.status(200).json({ statusCode: 200, success: true, message: 'Get all offers', data: offers });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function updateOffer(req, res, next) {
    try {
        const { startDate, endDate, percentage, product, name, description } = req.body;
        const findOffer = await OfferModel.findById(req.params.id);
        const { file } = req;
        if (!findOffer) {
            return next(new ApiError(400, 'Offer is not exist'));
        }
        findOffer.startDate = startDate || findOffer.startDate;
        findOffer.endDate = endDate || findOffer.endDate;
        findOffer.percentage = percentage || findOffer.percentage;
        findOffer.product = product || findOffer.product;
        findOffer.name = name || findOffer.name;
        findOffer.description = description || findOffer.description;
        await findOffer.save({ validateBeforeSave: true });
        if (file) {
            await destroy(findOffer.publicId);
            const result = await upload(req.file.path);
            findOffer.image = result.secure_url;
            findOffer.publicId = result.public_id;
        }
        await findOffer.save({ validateBeforeSave: true });
        res.status(200).json({
            statusCode: 200,
            success: true,
            message: 'Offer update successfully'
        });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function deleteOffer(req, res, next) {
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
            promises.push(OfferModel.findOneAndDelete({ _id: idsToDelete[i] }));
        }
        await Promise.all(promises);
        res.status(200).json({ statusCode: 200, success: true, message: "Offers deleted successfully" });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

module.exports = { addOffer, getAllOffer, updateOffer, deleteOffer };
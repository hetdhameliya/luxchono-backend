const ApiError = require("../../util/error");
const { upload, destroy } = require("../../util/cloudinary");
const BrandModel = require("../../model/admin/brand_model");
const { isValidObjectId } = require('mongoose');

async function add(req, res, next) {
    try {
        const existingBrand = await BrandModel.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') });
        if (existingBrand) {
            return next(new ApiError(400, "Brand name must be unique"));
        }
        if (req.files.image === undefined || req.files.icon === undefined) {
            return next(new ApiError(400, "icon and image required"));
        }
        const iconResult = await upload(req.files.icon[0].path);
        const imageResult = await upload(req.files.image[0].path);
        req.body.icon = iconResult.secure_url;
        req.body.iconPublicId = iconResult.public_id;
        req.body.image = imageResult.secure_url;
        req.body.imagePublicId = imageResult.public_id;
        const brand = new BrandModel(req.body);
        await brand.save();
        res.status(200).json({ statusCode: 200, success: true, message: "Brand add successfully", data: brand });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function get(req, res, next) {
    try {
        let search = {};
        if (req.query.search) {
            search = {
                $or: [
                    { name: new RegExp(req.query.search, "i") }
                ]
            }
        }
        const brands = await BrandModel.find(search);
        res.status(200).json({ statusCode: 200, success: true, data: brands });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}
async function update(req, res, next) {
    try {
        const { name } = req.body;
        const brand = await BrandModel.findById(req.params.id);
        if (name !== undefined) {
            if (name !== brand.name) {
                const existingBrand = await BrandModel.findOne({ name: new RegExp('^' + name + '$', 'i') });
                if (existingBrand) {
                    return next(new ApiError(400, "Brand name must be unique"));
                } else {
                    brand.name = name;
                }
            } else {
                brand.name = name;
            }
        }
        if (req.files.image !== undefined) {
            const imageResult = await upload(req.files.image[0].path);
            await destroy(brand.imagePublicId);
            brand.imagePublicId = imageResult.public_id;
            brand.image = imageResult.secure_url;
        }
        if (req.files.icon !== undefined) {
            const iconResult = await upload(req.files.icon[0].path);
            await destroy(brand.iconPublicId);
            brand.iconPublicId = iconResult.public_id;
            brand.icon = iconResult.secure_url;
        }
        await brand.save();
        res.status(200).json({ statusCode: 200, success: true, message: "Brand update successfully", data: brand });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function deleteBrand(req, res, next) {
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
        for (let i = 0; i < idsToDelete.length; i++) {
            await BrandModel.findOneAndDelete({ _id: idsToDelete[i] });
        }
        res.status(200).json({ statusCode: 200, success: true, message: "Brands deleted successfully" });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}
module.exports = { add, get, update, deleteBrand };
const ApiError = require("../../util/error");
const { upload, destroy } = require("../../util/cloudinary");
const CategoryModel = require("../../model/admin/category_model");
const { isValidObjectId } = require('mongoose');

async function add(req, res, next) {
    try {
        const existingCategory = await CategoryModel.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') });
        if (existingCategory) {
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
        const category = new CategoryModel(req.body);
        await category.save();
        res.status(200).json({ success: true, message: "Category add successfully", data: category });
    } catch (e) {
        console.log(e);
        return next(new ApiError(400, e.message));
    }
}

async function get(req, res, next) {
    try {
        const categories = await CategoryModel.find();
        res.status(200).json({ success: true, data: categories });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}
async function update(req, res, next) {
    try {
        const { name } = req.body;
        const category = await CategoryModel.findById(req.params.id);
        if (name !== undefined) {
            if (name !== category.name) {
                const existingCategory = await CategoryModel.findOne({ name: new RegExp('^' + name + '$', 'i') });
                if (existingCategory) {
                    return next(new ApiError(400, "Brand name must be unique"));
                } else {
                    category.name = name;
                }
            } else {
                category.name = name;
            }
        }
        if (req.files.image !== undefined) {
            const imageResult = await upload(req.files.image[0].path);
            await destroy(category.imagePublicId);
            category.imagePublicId = imageResult.public_id;
            category.image = imageResult.secure_url;
        }
        if (req.files.icon !== undefined) {
            const iconResult = await upload(req.files.icon[0].path);
            await destroy(category.iconPublicId);
            category.iconPublicId = iconResult.public_id;
            category.icon = iconResult.secure_url;
        }
        await category.save();
        res.status(200).json({ success: true, message: "Category update successfully", data: category });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function deleteCategory(req, res, next) {
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
            await CategoryModel.findOneAndDelete({ _id: idsToDelete[i] });
        }
        res.status(200).json({ success: true, message: "Brands deleted successfully" });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}
module.exports = { add, get, update, deleteCategory };
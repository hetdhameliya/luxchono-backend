const ApiError = require("../util/error");
const AddressModel = require("../model/address_model");

async function addAddress(req, res, next) {
    try {
        const body = req.body;
        body.uid = req.id;
        const address = new AddressModel(body);
        await address.save();
        res.status(200).json({ statusCode: 201, success: true, message: 'Address save successfully' });
    } catch (e) {
        return next(new ApiError(400, 'Enter valid address details'));
    }
}

async function getAddress(req, res, next) {
    try {
        const uid = req.id;
        const addresses = await AddressModel.find({ uid }).select("-uid");
        res.status(200).json({ statusCode: 200, success: true, message: 'Get all address', data: addresses });
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function getOneAddress(req, res, next) {
    try {
        const uid = req.id;
        const id = req.params.id;
        const address = await AddressModel.findOne({ uid, _id: id }).select("-uid");
        if (address) {
            return res.status(200).json({ statusCode: 200, success: true, message: 'Get address', data: address });
        } else {
            return next(new ApiError(400, 'Address not found'));
        }
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function updateAddress(req, res, next) {
    try {
        const body = req.body;
        const aid = req.params.id;
        const uid = req.id;
        const updateAddress = await AddressModel.findOneAndUpdate({ uid, _id: aid }, { $set: body }, { runValidators: true, new: true });
        if (updateAddress) {
            res.status(200).json({ statusCode: 200, success: true, message: "Address update successfully" });
        } else {
            return next(new ApiError(400, 'Address not found'));
        }
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

async function deleteAddress(req, res, next) {
    try {
        const uid = req.id;
        const aid = req.params.id;
        const response = await AddressModel.findOneAndDelete({ _id: aid, uid });
        if (response) {
            res.status(200).json({ statusCode: 200, success: true, message: 'Address delete successfully' });
        } else {
            return next(new ApiError(400, "Address is not exist"));
        }
    } catch (e) {
        return next(new ApiError(400, e.message));
    }
}

module.exports = { addAddress, getAddress, getOneAddress, updateAddress, deleteAddress };
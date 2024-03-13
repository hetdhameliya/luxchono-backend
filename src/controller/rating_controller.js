const ApiError = require("../util/error");
const RatingModel = require("../model/rating_model");
const OrderModel = require("../model/order_model");

async function addRating(req, res, next) {
    try {
        const { product, description, star } = req.body;
        const id = req.id;
        const foundRating = await RatingModel.findOne({ user: id, product });
        if (foundRating) {
            foundRating.description = description;
            foundRating.star = star;
            await foundRating.save();
            return res.status(200).json({ statusCode: 200, success: true, message: 'Thank you for your rating! Your feedback helps us improve our products and services. We appreciate your valuable input.' });
        }
        const foundOrder = await OrderModel.findOne({ user: id, "products.product": product });
        if (!foundOrder) {
            return next(new ApiError(400, "You can not give rating for this product"));
        }
        const rating = new RatingModel({ product, description, star, user: id });
        await rating.save();
        res.status(200).json({ statusCode: 200, success: true, message: 'Thank you for your rating! Your feedback helps us improve our products and services. We appreciate your valuable input.' });
    } catch (e) {
        return next(new ApiError(400, 'Enter valid address details'));
    }
}


module.exports = { addRating };
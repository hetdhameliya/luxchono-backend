const { Schema, model } = require("mongoose");

const ratingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    star: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }
},
    { timestamps: true }
);

const RatingModel = model('ratings', ratingSchema);

module.exports = RatingModel;
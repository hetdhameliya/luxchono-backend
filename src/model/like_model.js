const { Schema, model } = require('mongoose');

const likeSchema = new Schema({
    pid: {
        type: Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    uid: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    }
},
    { timestamps: true },
);

const LikeModel = model('likes', likeSchema);

module.exports = LikeModel;
const { Schema, model } = require("mongoose");
const { PUBLIC_NOTIFICATION, PRIVATE_NOTIFICATION } = require("../config/string");

const notificationSchema = new Schema({
    type: {
        type: String,
        enum: [PUBLIC_NOTIFICATION, PRIVATE_NOTIFICATION],
        default: PUBLIC_NOTIFICATION
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    extra: {
        type: Map
    }
}, { timestamps: true });

const NotificationModel = model("notifications", notificationSchema);

module.exports = NotificationModel;
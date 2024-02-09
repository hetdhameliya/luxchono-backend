const { Schema, model } = require("mongoose");

const addressSchema = new Schema(
    {
        uid: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        alternativePhoneNo: {
            type: String,
            default: null
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        addressType: {
            type: String,
            enum: ['Office', 'Home'],
            required: true
        }
    },
    {
        timestamps: true
    }
);

const AddressModel = model('addresses',addressSchema);

module.exports = AddressModel;
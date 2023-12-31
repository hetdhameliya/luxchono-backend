const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = require("../config/config");
const { CLOUDINARY_FOLDER_NAME } = require("../config/string");

const cloudiary = require("cloudinary").v2;
const fs = require("fs");

cloudiary.config({
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
	cloud_name: CLOUDINARY_CLOUD_NAME,
});

module.exports.upload = async function (path, folder = CLOUDINARY_FOLDER_NAME) {
	const result = await cloudiary.uploader.upload(path, { folder, overwrite: true });
	fs.unlinkSync(path);
	return result;
}

module.exports.destroy = async function (publicId) {
	await cloudiary.uploader.destroy(publicId);
}
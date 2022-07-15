const cloudinary = require('cloudinary');
const fileupload = require('express-fileupload');
const cloudinaryConfig = require('../_configs/cloudinary.config');

cloudinary.config({
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key,
    api_secret: cloudinaryConfig.api_secret,
});

exports.upload = (files) => {
    return new Promise((resolve, reject) => {
        if (files.profileImage) {
            cloudinary.v2.uploader.upload(files.profileImage.filepath, {
                folder: 'profile_photos', width: 200, height: 200,
            }).then((uploaded) => {
                resolve(uploaded.url);
            }).catch((err) => {
                reject(err);
            });
        } else if (files.companyImage) {
            cloudinary.v2.uploader.upload(files.companyImage.filepath, {
                folder: 'company_photos', width: 200, height: 200,
            }).then((uploaded) => {
                resolve(uploaded.url);
            }).catch((err) => {
                reject(err);
            });
        }
    });
}
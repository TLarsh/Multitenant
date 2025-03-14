const multer = require("multer");
const sharp = require("sharp");
const path = require ("path");
const fs = require('fs');

const multerStorage = multer.diskStorage({
    destination: function ( req, file, cb ) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function ( req, file, cb ) {
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() + 1e9);
        cb(null, file.fieldname + "_" + uniqueSuffix + ".jpeg");
    },
});

const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null,true)
    } else {
        cb(
            {
                message:"Unsupported"
            },
            false
        );
    }
};

const uploadPhoto = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fieldSize: 2000000 }
});

const profileImgResize = async(req, res, next) => {
    if (!req.files) return next();
    await Promise.all(
        req.files.map(async(file) => {
            await sharp(file.path)
            .resize(300,300)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`public/images/${file.filename}`);
            fs.unlinkSync(`public/images/${file.filename}`)
        })
        );
        next();
    };

    

module.exports = { uploadPhoto, profileImgResize };
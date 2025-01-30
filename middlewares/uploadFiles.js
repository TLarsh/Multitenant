const multer = require("multer");
const path = require ("path");
const fs = require('fs');



const multerStorage = multer.diskStorage({
    destination: function ( req, file, cb ) {
        cb(null, 'uploads/');
    },
    filename: function ( req, file, cb ) {
        // const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() + 1e9);
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const multerFilter = function (req, file, cb) {
    const allowedExtensions = [".xlsx", ".xls"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
        cb(null,true)
    } else {
        cb(
            {
                error:"Unsupported, only Excel files are allowed"
            },
            false
        );
    }
};

const AgreementForm = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

module.exports = { AgreementForm, };
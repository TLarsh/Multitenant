const multer = require("multer");
const path = require("path");

// Set storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// File filter to allow only Excel files
const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only Excel files are allowed!"), false);
    }
};

// Initialize multer with storage and file filter
const upload = multer({
    storage,
    fileFilter,
});

module.exports = { upload };

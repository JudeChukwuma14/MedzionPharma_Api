const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory instead of disk

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images of JPEG, PNG, JPG are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 15, // 15MB limit
    },
}).fields([
    { name: "brandLogo", maxCount: 1 }, // Single file for brand logo
    { name: "images", maxCount: 5 },   // Up to 5 files for product images
]);

module.exports = upload;
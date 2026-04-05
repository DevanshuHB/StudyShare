const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir); // Upload dir
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

// File validation
const checkFileType = (file, cb) => {
    // Allowed extensions (preventing scripts/executables)
    const filetypes = /jpg|jpeg|png|pdf|txt|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images, PDFs, and Docs only!'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 50000000 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;

const multer = require('multer');
const path = require('path');

// Set up storage engine
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and pdfs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only images and PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;

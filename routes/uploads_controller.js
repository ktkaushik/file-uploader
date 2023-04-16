const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');
const express = require('express');
const router  = express.Router();
const config  = require('../config')();

router.get('/', (req, res, next) => {
    res.format({
        html: () => {
            return res.render('uploads/new', {});
        },

        json: () => {
            res.json({
                hello: true
            });
        }
    });
});
// console.log(`${config.constants.uploadsDirectoryName}/`)


// Set storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${config.constants.uploadsDirectoryName}/`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Initialize multer with storage engine
const upload = multer({ storage: storage });

// Route for file upload
router.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const filePath = path.join(__dirname, '..', `${config.constants.uploadsDirectoryName}`, file.filename);

    // Create a write stream to the file
    const writeStream = fs.createWriteStream(filePath);

    // Pipe the request stream to the write stream
    req.pipe(writeStream);

    // Listen for errors
    writeStream.on('error', (err) => {
        console.error(err);
        res.status(500).send('An error occurred while uploading the file');
    });

    // Listen for completion
    writeStream.on('finish', () => {
        console.log(`File uploaded to ${filePath}`);
        res.send('File uploaded successfully');
    });
});

module.exports = router;

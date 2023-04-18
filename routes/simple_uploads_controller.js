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

const upload = multer({ 
    storage: storage,
    limit: config.constants.sizeLimits // 1 GB
});

router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
        console.error(err);
        res.status(500).send('An error occurred while uploading the file(s)');
        return;
        }

        console.log('Files uploaded successfully');
        res.send('Files uploaded successfully');
    });
});

router.post('/multi-upload', upload.array('files'), (req, res, next) => {
    const file = req.files[0]
    console.log(file)
    const filePath = path.join(__dirname, '..', `${config.constants.uploadsDirectoryName}`, file.filename)
    const writeStream = fs.createWriteStream(filePath)
    // With the open - event, data will start being written
    // from the request to the stream's destination path
    writeStream.on('open', () => {
        console.log('Stream open ...  0.00%');
        req.pipe(writeStream);
    });

    // When the stream is finished, print a final message
    // Also, resolve the location of the file to calling function
    writeStream.on('close', () => {
        console.log('Processing  ...  100%');
        // resolve(filePath);
    });

    return res.json({done: true})
})

module.exports = router;

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
            })
        }
    });
});

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

// 1st iteration - does not use Streams to upload files
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

module.exports = router;
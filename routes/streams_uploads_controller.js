const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');

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

// Set up storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`the IP address is ${req.ip}`)
        // const ip = req.ip
        const ip = '10.10.10.10'
        const uploadDir = path.join(__dirname, '..', 'uploads', ip);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    originalName: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `${timestamp}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB
    }
});

router.post('/upload', upload.array('files'), (req, res) => {
    const uploadedFiles = [];
    // const ip = req.ip;
    const ip = '10.10.10.10';
    const uploadDir = path.join(__dirname, '..', 'uploads', ip);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileStreams = req.files.map((file) => {
        const timestamp = Date.now();
        const readFilePath = path.join(uploadDir, file.filename)
        const readStream = fs.createReadStream(readFilePath)
        const filePath = path.join(uploadDir, file.originalname);
        const writeStream = fs.createWriteStream(filePath, 'utf8');
        readStream.pipe(writeStream)
        uploadedFiles.push(file.originalname);

        writeStream.on('error', (error) => {
            console.error('Error while uploading file')
            writeStream.end()
            throw error
        })

        writeStream.on('finish', () => {
            console.log('done writing..........')
            writeStream.end()
            fs.unlinkSync(readFilePath);
        })
    });

    return res.json({done: true})
});

module.exports = router;
const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const fs      = require('fs')
const path    = require('path')
const config  = require('../config')()
const Limiter = require('../lib/limiter')

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
        const uploadDir = path.join(__dirname, '..', 'temp');
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

// Configure multer to upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB
    }
});

/**
 * 1. Get IP of the user
 * 2. check if folder exists
 * 3. check how many files are uploaded by the user
 * 4. if number of files is more than cnofigured amount then throw error
 * 5. if number of files are not more than configured amount then upload the file
 * 6. check when was the first file uploaded
 * 7. 
 */
router.post('/upload', upload.array('files'), async (req, res, next) => {
    const uploadedFiles = [];
    // const ip = req.ip;
    const ip = '10.10.10.10';
    const files = req.files

    const {allow, message} = await new Limiter(ip, files).allowUploadsForThisIP()
    console.log(`Allowed? ${allow}`)
    console.log(`Message? ${message}`)
    if (allow) {

        const tempDir   = path.join(__dirname, '..', 'temp');
        const uploadDir = path.join(__dirname, '..', config.constants.uploadsDirectoryName, ip);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileStreams = req.files.map((file) => {
            const timestamp    = Date.now();
            const readFilePath = path.join(tempDir, file.filename)
            const readStream   = fs.createReadStream(readFilePath)
            const filePath     = path.join(uploadDir, file.originalname);
            const writeStream  = fs.createWriteStream(filePath, 'utf8');
            // init read stream so we can write a new file
            readStream.pipe(writeStream)
            uploadedFiles.push(file.originalname);

            // error handling
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
    } else {
        files.forEach((file) => {
            const readFilePath = path.join(__dirname, '..', 'temp', file.filename)
            fs.unlinkSync(readFilePath);
        })
        return next(new Error(message))
    }

    return res.json({done: true})
});

module.exports = router;
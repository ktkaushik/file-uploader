const express     = require('express')
const Multer      = require('multer')
const { Storage } = require('@google-cloud/storage');
const path        = require('path')

const router  = express.Router();

// paste your gcp service account file
// const storage = new Storage({ keyFilename: path.join(__dirname, '../', 'gcp-service-account.json') });
const bucket  = storage.bucket('meldcx_assignment');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 5 MB file size limit
    }
})

router.post('/upload', multer.array('files'), async (req, res, next) => {
    try {
        const files = req.files

        const uploadPromises = files.map(async (file) => {
            const blob = bucket.file(file.originalname)

            const stream = blob.createWriteStream({
                resumable: false,
                gzip: true,
                contentType: file.mimetype,
            });

            stream.on('error', (err) => {
                console.error(err);
                next(err)
            })

            stream.on('finish', async () => {
                await blob.makePublic();
            })

            stream.end(file.buffer);
        })

        await Promise.all(uploadPromises);

        return res.json({
            success: true
        })

    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
const express   = require('express')
const router    = express.Router()
const multer    = require('multer')
const fs        = require('fs')
const path      = require('path')
const config    = require('../config')()
const zipFolder = require('zip-a-folder')
const Limiter   = require('../lib/limiter')
const FilesManager = require('../lib/files_manager')
const {
    getPrivateKey, 
    base64Encode, 
    getEncodedFolderNameForIP,
    getFolderNameFromPublicKey,
    base64Decode
}  = require('../lib/utilities')

// Set up storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        // we will store files in a 'temp' director
        const tempDirPath = path.join(__dirname, '..', 'temp')

        // make the temp directory if it doesn't exist
        if (!fs.existsSync(tempDirPath)) {
            fs.mkdirSync(tempDirPath, { recursive: true })
        }
        cb(null, tempDirPath)
    },
    originalName: (req, file, cb) => {
        // const timestamp = Date.now()
        cb(null, file.originalname)
    }
})

// Configure multer to upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB
    }
})

// Upload files route
router.post('/', upload.array('files'), async (req, res, next) => {
    try {

        const files = req.files

        // const ip = req.ip
        const ip = '10.10.10.10'

        // Initialise FilesManager and get folder info for this up
        const filesManager = new FilesManager(ip, files)
        const {uploadDirPath, publicKey, privateKey} = filesManager.getFolderInfo()

        // Call the Limiter module and check if uploads are allowed
        const {allow, errorMessage} = await new Limiter(ip, files, uploadDirPath).allowUploadsForThisIP()

        if (allow) {

            // upload files
            await filesManager.upload()

            // send response with publicKey and privateKey
            return res.json({success: true, publicKey, privateKey})
        } else {

            // delete temp files
            files.forEach((file) => {
                const readFilePath = path.join(__dirname, '..', 'temp', file.filename)
                fs.rmSync(readFilePath)
            })

            // throw error using next so it can be handled centrally
            return next(new Error(errorMessage))
        }

    } catch (error) {
        return next(error)
    }

})

// Download all the files uploaded by zipping it. Most browsers won't support downloading multiple files simultaneously
router.get('/:publicKey', async (req, res, next) => {
    try {
        // const ip = req.ip
        const ip = '10.10.10.10'

        const publicKey = req.params.publicKey

        // get path to upload files for this IP
        const uploadDirPath = path.join(__dirname, '..', config.constants.uploadsDirectoryName, getFolderNameFromPublicKey(publicKey))

        // create a folder for this IP if it doesn't exist
        if (!fs.existsSync(uploadDirPath)) {
            return res.status(200).json({
                files_found: false,
                message: config.constants.messages.noFilesFound
            })
        }

        const zippedFolderPath = path.join(__dirname, '../temp', 'files-archive.zip')
        await zipFolder.zip(uploadDirPath, zippedFolderPath)

        // 
        res.setHeader('Content-Disposition', 'attachment; filename=files-archive.zip');

        // Create a read stream from the file
        const donwloadStream = fs.createReadStream(zippedFolderPath)

        // Pipe the read stream to the response stream
        donwloadStream.pipe(res)

    } catch (error) {
        return next(error)
    }
})

// Delete all files and folder associated with this private key
router.delete('/:privateKey', async (req, res, next) => {
    try {
        if (req.params.privateKey) {
            const filesManager = new FilesManager(false, false, false, req.params.privateKey)

            const {folderFound, totalFilesDeleted} = await filesManager.deleteAllFiles()

            if (folderFound) {
                return res.json({
                    success: true,
                    action: 'delete',
                    totalFilesDeleted: totalFilesDeleted
                })
            } else {
                return res.status(304).json({message: 'No files found to delete'})
            }

        } else {
            return next(new Error(config.constants.missingPrivateKey))
        }
    } catch (error) {
        return next(error)
    }
})

// Render the form for UI based uploads. 
router.get('/new', (req, res, next) => {
    return res.format({
        html: () => {
            return res.render('uploads/new', {})
        },

        json: () => {
            res.json({
                hello: true
            })
        }
    })
})

module.exports = router
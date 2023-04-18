const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const fs      = require('fs')
const path    = require('path')
const config  = require('../config')()
const Limiter = require('../lib/limiter')
const FilesManager = require('../lib/files_manager')
const {
    getPrivateKey, 
    base64Encode, 
    getEncodedFolderNameForIP,
    getFolderNameFromPrivateKey
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

/**
 * 1. Get IP of the user
 * 2. check if folder exists
 * 3. check how many files are uploaded by the user
 * 4. if number of files is more than cnofigured amount then throw error
 * 5. if number of files are not more than configured amount then upload the file
 * 6. check when was the first file uploaded
 * 7. 
 */
router.post('/', upload.array('files'), async (req, res, next) => {
    try {

        const files = req.files
        const uploadedFiles = []
        // const ip = req.ip
        const ip = '10.10.10.10'

        const filesManager = new FilesManager(ip, files)
        const {uploadDirPath, publicKey, privateKey} = filesManager.getFolderInfo()

        console.log({uploadDirPath, publicKey, privateKey})
        // Call the Limiter module and check if uploads are allowed
        const {allow, errorMessage} = await new Limiter(ip, files, uploadDirPath).allowUploadsForThisIP()

        if (allow) {

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

router.get('/:publicKey', async (req, res, next) => {
    try {
        const uploadedFiles = []
        const files = req.files

        // const ip = req.ip
        const ip = '10.10.10.10'

        // get publicKey and privateKey
        const publicKey  = base64Encode(ip)
        const privateKey = getPrivateKey(ip)

        // Call the Limiter module and check if uploads are allowed
        const {allow, errorMessage} = await new Limiter(ip, files, publicKey, privateKey).allowUploadsForThisIP()

        console.log(`Allowed? ${allow}`)
        console.log(`errorMessage? ${errorMessage}`)

        // get path for temp upload of files
        const tempDir = path.join(__dirname, '..', 'temp')

        // get path to upload files for this IP
        const uploadDir = path.join(__dirname, '..', config.constants.uploadsDirectoryName, getEncodedFolderNameForIP(publicKey, privateKey))

        // create a folder for this IP if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // begin uploading
        files.forEach((file) => {

            // read file from temp path
            const readFilePath = path.join(tempDir, file.filename)
            const readStream   = fs.createReadStream(readFilePath)

            // set write file path
            const writeFilePath = path.join(uploadDir, file.originalname)
            const writeStream   = fs.createWriteStream(writeFilePath, 'utf8')

            // init read stream so we can write a new file
            readStream.pipe(writeStream)

            // send response of each file uploaded. TBD
            uploadedFiles.push(file.originalname)

            // error handling
            writeStream.on('error', (error) => {
                console.error('Error while uploading file')
                writeStream.end()
                throw error
            })

            // Uploads finish
            writeStream.on('finish', () => {
                console.log(`File uploaded ${file.originalname}`)
                writeStream.end()
                fs.unlinkSync(readFilePath)
            })
        })

        // send response with publicKey and privateKey
        return res.json({uploads: true, publicKey, privateKey})

    } catch (error) {
        return next(error)
    }
})

/**
 * Delete all files and folder associated with this private key
 */
router.delete('/:privateKey', async (req, res, next) => {
    try {
        if (req.params.privateKey) {

            const filesManager = new FilesManager(false, false, req.params.privateKey)

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
router.get('/', (req, res, next) => {
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
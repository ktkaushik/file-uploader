
const fs      = require('fs')
const path    = require('path')
const config  = require('../../config')()
const moment  = require('moment')
const {
    getPrivateKey, 
    base64Encode, 
    getEncodedFolderNameForIP,
    getFolderNameFromPrivateKey,
    getFolderNameFromPublicKey,
    isDirectoryEmpty
}  = require('../utilities')

class FilesManager {

    constructor (ip, files, publicKey, privateKey) {
        this.ip = ip
        this.files = files
        this.publicKey  = publicKey
        this.privateKey = privateKey
    }

    // A static function to find and delete all files who have breached 
    // their time limits and expire them 
    static async deleteExpiredFiles () {
        try {
            const allUploadsPath = path.join(__dirname, '../../', config.constants.uploadsDirectoryName)
            const allFiles   = fs.readdirSync(allUploadsPath)
            const totalFilesDeleted = 0
            allFiles.forEach((file) => {

                const fileFound = path.join(allUploadsPath, file)

                // get file stats
                const stats = fs.statSync(path.join(allUploadsPath, file))

                // uploaded file timestamp in utc
                const fileUploadedAt = moment.utc(stats.mtime)

                // current time in utc
                const now = moment.utc()

                // get duration passed since file uploaded 
                const duration = moment.duration(now.diff(fileUploadedAt))

                // get limit in minutes
                const timeLimitInMinutes = moment(config.constants.purgeUploadsTimeMeasure, 'minutes').minutes()

                // is this a file and not a directory?
                if (stats.isFile()) {

                    // Consider only if fileUploadedAt has breached the storage limit
                    if (duration.asMinutes() > timeLimitInMinutes) {
                        console.log(`deleting ${file}`)

                        // remove file
                        fs.rmSync(fileFound)

                        // increase counter
                        totalFilesDeleted++
                    }
                } else if (stats.isDirectory()) {

                    // this is a director
                    const directoryFound = fileFound

                    // is directoryFound empty?
                    if (isDirectoryEmpty(directoryFound)) {

                        // if empty, delete the directory to keep our uploads folder clean
                        fs.rmdirSync(directoryFound)
                    } else {

                        // if not empty, then let's iterate over the files and find all files who have breached time limit
                        const files = fs.readdirSync(directoryFound)
                        files.forEach((file) => {

                            // remove only if time limit is breached
                            if (duration.asMinutes() > timeLimitInMinutes) {
                                console.log(`deleting ${file}`)

                                // remove file
                                fs.rmSync(path.join(fileFound, file))

                                // increase counter
                                totalFilesDeleted++
                            }
                        })
                    }
                }
            })

            return totalFilesDeleted
        } catch (error) {
            console.error(error)
        }
    }

    // Get the folder, public key, and private key
    getFolderInfo () {
        // get publicKey
        const publicKey  = base64Encode(this.ip)

        // get privateKey
        const privateKey = getPrivateKey(this.ip)

        // set folder path for this ip
        this.uploadDirPath = path.join(__dirname, '../../', config.constants.uploadsDirectoryName, getEncodedFolderNameForIP(publicKey, privateKey))

        return {uploadDirPath: this.uploadDirPath, publicKey, privateKey}
    }

    // Upload files
    async upload () {
        // get path for temp upload of files
        const tempDir = path.join(__dirname, '../../', 'temp')

        // create a folder for this IP if it doesn't exist
        if (!fs.existsSync(this.uploadDirPath)) {
            fs.mkdirSync(this.uploadDirPath, { recursive: true })
        }

        // begin uploading
        this.files.forEach((file) => {

            // read file from temp path
            const readFilePath = path.join(tempDir, file.filename)
            const readStream   = fs.createReadStream(readFilePath)

            // set write file path
            const writeFilePath = path.join(this.uploadDirPath, file.originalname)
            const writeStream   = fs.createWriteStream(writeFilePath, 'utf8')

            // init read stream so we can write a new file
            readStream.pipe(writeStream)

            // send response of each file uploaded. TBD
            // uploadedFiles.push(file.originalname)

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

                // Delete the temp file
                fs.rmSync(readFilePath)
            })
        })
    }

    // Delete all files
    async deleteAllFiles () {

        // get folderName for this private key
        const folderName = getFolderNameFromPrivateKey(this.privateKey)

        // get path to upload files for this IP
        const folderPath = path.join(__dirname, '../../', config.constants.uploadsDirectoryName, folderName)

        // create a folder for this IP if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            return {
                folderFound: false
            }
        }

        // delete each file and empty the folder. 
        // caveat: we can't delete a folder if it's not empty.
        const uploadedFiles = fs.readdirSync(folderPath)
        uploadedFiles.forEach((file) => {
            fs.rmSync(path.join(folderPath, file))
        })

        // delete the folder
        fs.rmdirSync(path.join(folderPath))

        return {
            folderFound: true,
            totalFilesDeleted: uploadedFiles.length
        }
    }

}

module.exports = FilesManager
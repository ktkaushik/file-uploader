
const fs      = require('fs')
const path    = require('path')
const config  = require('../../config')()
const {
    getPrivateKey, 
    base64Encode, 
    getEncodedFolderNameForIP,
    getFolderNameFromPrivateKey
}  = require('../utilities')

class FilesManager {
    constructor (ip, files, privateKey) {
        this.ip = ip
        this.files = files
        this.privateKey = privateKey
    }

    getFolderInfo () {
        // get publicKey and privateKey
        const publicKey  = base64Encode(this.ip)
        const privateKey = getPrivateKey(this.ip)
        this.uploadDirPath = path.join(__dirname, '../../', config.constants.uploadsDirectoryName, getEncodedFolderNameForIP(publicKey, privateKey))
        return {uploadDirPath: this.uploadDirPath, publicKey, privateKey}
    }

    getFolderInfoFromPrivateKey () {

    }

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